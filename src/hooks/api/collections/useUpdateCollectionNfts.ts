import { useCallback } from 'react';
import { CollectionLayout } from 'types/Collection';
import { StagingItem } from 'flows/shared/steps/OrganizeCollection/types';
import {
  getWhitespacePositionsFromStagedItems,
  removeWhitespacesFromStagedItems,
} from 'utils/collectionLayout';
import { fetchQuery, graphql } from 'relay-runtime';
import { useRelayEnvironment } from 'react-relay';
import { useUpdateCollectionNftsRefresherQuery } from '__generated__/useUpdateCollectionNftsRefresherQuery.graphql';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useUpdateCollectionNftsMutation } from '__generated__/useUpdateCollectionNftsMutation.graphql';

export default function useUpdateCollectionNfts() {
  const relayEnvironment = useRelayEnvironment();
  const [updateCollectionNfts] = usePromisifiedMutation<useUpdateCollectionNftsMutation>(
    graphql`
      mutation useUpdateCollectionNftsMutation($input: UpdateCollectionNftsInput!) {
        updateCollectionNfts(input: $input) {
          __typename
        }
      }
    `
  );

  return useCallback(
    async (collectionId: string, stagedNfts: StagingItem[], collectionLayout: CollectionLayout) => {
      const layout = {
        ...collectionLayout,
        whitespace: getWhitespacePositionsFromStagedItems(stagedNfts),
      };
      const nfts = removeWhitespacesFromStagedItems(stagedNfts);
      const nftIds = nfts.map((nft) => nft.dbid);

      await updateCollectionNfts({
        variables: {
          input: {
            collectionId,
            nfts: nftIds,
            layout,
          },
        },
      });

      // Until everything is routed through GraphQL, we need
      // a mechanism to ensure that other pages using this data
      // get the updated data.
      //
      // This fetchQuery asks the server for a collection.
      // We're also ensuring that any other pages that need data
      // off of a collection are getting their data requirements
      // refreshed. These four fragments are the only fragmeents
      // on this type, so we should be good.
      //
      // If you want to ensure this list of fragments is up to date
      // you can global search for `on Collection` to find
      // all of the fragments on this type.
      //
      // In other places, we can do an optimistic update since
      // there's not much data to update (hidden, collectorsNote, etc).
      // Here, we'd have to optimistically update a bunch of nfts which
      // is more risky since that mapping logic might get out of hand.
      // The safer approach here is to just refetch the data.
      await fetchQuery<useUpdateCollectionNftsRefresherQuery>(
        relayEnvironment,
        graphql`
          query useUpdateCollectionNftsRefresherQuery($id: DBID!) {
            collectionById(id: $id) {
              ...NftGalleryFragment
              ...CollectionRowFragment
              ...CollectionRowDraggingFragment
              ...CollectionRowSettingsFragment
              ...CollectionRowWrapperFragment
              ...DeleteCollectionConfirmationFragment
              ...SortableCollectionRowFragment
              ...useCollectionColumnsFragment
              ...UserGalleryCollectionFragment
              ...useCollectionColumnsFragment
              ...CollectionGalleryHeaderFragment
            }
          }
        `,
        {
          id: collectionId,
        }
      ).toPromise();
    },
    [relayEnvironment, updateCollectionNfts]
  );
}

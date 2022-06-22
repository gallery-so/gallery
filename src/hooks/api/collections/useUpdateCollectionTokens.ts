import { useCallback } from 'react';
import { StagingItem } from 'flows/shared/steps/OrganizeCollection/types';
import {
  getWhitespacePositionsFromStagedItems,
  removeWhitespacesFromStagedItems,
} from 'utils/collectionLayout';
import { fetchQuery, graphql } from 'relay-runtime';
import { useRelayEnvironment } from 'react-relay';
import { useUpdateCollectionTokensRefresherQuery } from '__generated__/useUpdateCollectionTokensRefresherQuery.graphql';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import {
  UpdateCollectionTokensInput,
  useUpdateCollectionTokensMutation,
} from '__generated__/useUpdateCollectionTokensMutation.graphql';

export default function useUpdateCollectionTokens() {
  const relayEnvironment = useRelayEnvironment();
  const [updateCollectionTokens] = usePromisifiedMutation<useUpdateCollectionTokensMutation>(
    graphql`
      mutation useUpdateCollectionTokensMutation($input: UpdateCollectionTokensInput!) {
        updateCollectionTokens(input: $input) {
          __typename
        }
      }
    `
  );

  return useCallback(
    async (
      collectionId: string,
      stagedNfts: StagingItem[],
      collectionLayout: UpdateCollectionTokensInput['layout']
    ) => {
      const layout = {
        ...collectionLayout,
        whitespace: getWhitespacePositionsFromStagedItems(stagedNfts),
      };
      const tokens = removeWhitespacesFromStagedItems(stagedNfts);
      const tokenIds = tokens.map((token) => token.dbid);

      await updateCollectionTokens({
        variables: {
          input: {
            collectionId,
            tokens: tokenIds,
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
      // Here, we'd have to optimistically update a bunch of tokens which
      // is more risky since that mapping logic might get out of hand.
      // The safer approach here is to just refetch the data.
      await fetchQuery<useUpdateCollectionTokensRefresherQuery>(
        relayEnvironment,
        graphql`
          query useUpdateCollectionTokensRefresherQuery($id: DBID!) {
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
    [relayEnvironment, updateCollectionTokens]
  );
}

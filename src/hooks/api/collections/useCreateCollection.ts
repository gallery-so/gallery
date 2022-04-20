import { useCallback } from 'react';
import { StagingItem } from 'flows/shared/steps/OrganizeCollection/types';
import {
  getWhitespacePositionsFromStagedItems,
  removeWhitespacesFromStagedItems,
} from 'utils/collectionLayout';
import { graphql } from 'relay-runtime';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import {
  CreateCollectionInput,
  useCreateCollectionMutation,
} from '__generated__/useCreateCollectionMutation.graphql';

export default function useCreateCollection() {
  const [createCollection] = usePromisifiedMutation<useCreateCollectionMutation>(graphql`
    mutation useCreateCollectionMutation($input: CreateCollectionInput!) {
      createCollection(input: $input) {
        ... on CreateCollectionPayload {
          __typename

          collection {
            gallery {
              # This is how we update all galleries in the app.
              # Any other component that needs data from a collection
              # should have a fragment which we can spread here.
              #
              # Relay will automatically merge the response into
              # the cache so those components re-render with fresh data.
              #
              # If you want to ensure this list of fragments is up to date
              # you can global search for 'on Gallery {' & 'on Collection {' to find
              # all of the fragments on this type.
              #
              # In other places, we can do an optimistic update since
              # there's not much data to update (hidden, collectorsNote, etc).
              # Here, we'd have to optimistically update a bunch of nfts which
              # is more risky since that mapping logic might get out of hand.
              # The safer approach here is to just refetch the data.
              ...UserGalleryCollectionsFragment
            }

            # This list might be non-exhaustive but likely captures
            # everything we need to udpate the cache.
            ...NftGalleryFragment
            ...UserGalleryCollectionFragment
            ...useCollectionColumnsFragment
            ...CollectionRowSettingsFragment
            ...DeleteCollectionConfirmationFragment
            ...CollectionGalleryHeaderFragment
          }
        }
      }
    }
  `);

  return useCallback(
    async (
      galleryId: string,
      title: string,
      description: string,
      stagedNfts: StagingItem[],
      collectionLayout: CreateCollectionInput['layout']
    ) => {
      const layout = {
        ...collectionLayout,
        whitespace: getWhitespacePositionsFromStagedItems(stagedNfts),
      };
      const nfts = removeWhitespacesFromStagedItems(stagedNfts);
      const nftIds = nfts.map((nft) => nft.dbid);
      const response = await createCollection({
        variables: {
          input: {
            galleryId,
            name: title,
            collectorsNote: description,
            nfts: nftIds,
            layout,
          },
        },
      });

      if (response.createCollection?.__typename !== 'CreateCollectionPayload') {
        // TODO(Terence): How do we really want to handle this.
        throw new Error('something went wrong while creating your collection');
      }
    },
    [createCollection]
  );
}

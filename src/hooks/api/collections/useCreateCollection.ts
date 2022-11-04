import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { StagedCollection } from '~/components/ManageGallery/OrganizeCollection/types';
import { TokenSettings } from '~/contexts/collectionEditor/CollectionEditorContext';
import { useCreateCollectionMutation } from '~/generated/useCreateCollectionMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { generateLayoutFromCollection, getTokenIdsFromCollection } from '~/utils/collectionLayout';
import { collectionTokenSettingsObjectToArray } from '~/utils/collectionTokenSettings';

type Props = {
  galleryId: string;
  title: string;
  description: string;
  stagedCollection: StagedCollection;
  tokenSettings: TokenSettings;
  caption: string | null;
};

export default function useCreateCollection() {
  const [createCollection] = usePromisifiedMutation<useCreateCollectionMutation>(graphql`
    mutation useCreateCollectionMutation($input: CreateCollectionInput!) {
      createCollection(input: $input) {
        ... on ErrInvalidInput {
          __typename
          message
        }
        ... on CreateCollectionPayload {
          __typename

          collection {
            dbid

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
              # Here, we'd have to optimistically update a bunch of tokens which
              # is more risky since that mapping logic might get out of hand.
              # The safer approach here is to just refetch the data.
              ...UserGalleryCollectionsFragment
            }

            # This list might be non-exhaustive but likely captures
            # everything we need to udpate the cache.
            ...NftGalleryFragment
            ...UserGalleryCollectionFragment
            ...CollectionRowSettingsFragment
            ...DeleteCollectionConfirmationFragment
            ...CollectionGalleryHeaderFragment
          }
        }
      }
    }
  `);

  return useCallback(
    async ({ galleryId, title, description, stagedCollection, tokenSettings, caption }: Props) => {
      const layout = generateLayoutFromCollection(stagedCollection);
      const tokenIds = getTokenIdsFromCollection(stagedCollection);
      const tokenSettingsArray = collectionTokenSettingsObjectToArray(tokenSettings);

      const response = await createCollection({
        variables: {
          input: {
            galleryId,
            name: title,
            collectorsNote: description,
            tokens: tokenIds,
            layout,
            tokenSettings: tokenSettingsArray,
            ...(caption && { caption }),
          },
        },
      });

      if (response.createCollection?.__typename === 'ErrInvalidInput') {
        throw new Error('The description you entered is too long.');
      } else if (response.createCollection?.__typename !== 'CreateCollectionPayload') {
        throw new Error(
          `Something went wrong while creating your collection, we're looking into it.`
        );
      }

      return response;
    },
    [createCollection]
  );
}

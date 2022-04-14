import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import {
  useUpdateGalleryMutation,
  useUpdateGalleryMutation$data,
} from '__generated__/useUpdateGalleryMutation.graphql';

export default function useUpdateGallery() {
  const [updateGallery] = usePromisifiedMutation<useUpdateGalleryMutation>(graphql`
    mutation useUpdateGalleryMutation($input: UpdateGalleryCollectionsInput!) {
      updateGalleryCollections(input: $input) {
        __typename
        ... on UpdateGalleryCollectionsPayload {
          gallery {
            collections {
              id
            }
          }
        }
      }
    }
  `);

  return useCallback(
    async (galleryId: string, collections: string[]) => {
      const optimisticResponse: useUpdateGalleryMutation$data = {
        updateGalleryCollections: {
          __typename: 'UpdateGalleryCollectionsPayload',
          gallery: {
            collections: collections.map((id) => ({ id })),
          },
        },
      };

      await updateGallery({
        optimisticResponse,
        variables: {
          input: {
            galleryId,
            collections: collections,
          },
        },
      });
    },
    [updateGallery]
  );
}

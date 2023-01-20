import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useSetFeaturedGalleryMutation } from '~/generated/useSetFeaturedGalleryMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useSetFeaturedGallery() {
  const [setFeaturedGallery] = usePromisifiedMutation<useSetFeaturedGalleryMutation>(graphql`
    mutation useSetFeaturedGalleryMutation($galleryId: DBID!) @raw_response_type {
      updateFeaturedGallery(galleryId: $galleryId) {
        ... on UpdateFeaturedGalleryPayload {
          viewer {
            user {
              featuredGallery {
                id
              }
            }
          }
        }

        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  return useCallback(
    async (galleryId: string) => {
      try {
        const response = await setFeaturedGallery({
          variables: {
            galleryId,
          },
        });

        if (response?.updateFeaturedGallery?.__typename === 'ErrInvalidInput') {
          throw new Error('Failed to set featured gallery');
        }

        return response?.updateFeaturedGallery?.viewer?.user?.featuredGallery?.id;
      } catch (error) {
        throw new Error('Failed to set featured gallery');
      }
    },
    [setFeaturedGallery]
  );
}

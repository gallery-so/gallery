import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import { useDeleteGalleryMutation } from '~/generated/useDeleteGalleryMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useDeleteGallery() {
  const [deleteGallery] = usePromisifiedMutation<useDeleteGalleryMutation>(graphql`
    mutation useDeleteGalleryMutation($galleryId: DBID!) @raw_response_type {
      deleteGallery(galleryId: $galleryId) {
        ... on DeleteGalleryPayload {
          __typename
          deletedId {
            id
          }
        }

        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  return useCallback((galleryId: string) => {
    return deleteGallery({
      variables: {
        galleryId,
      },
    });
  }, []);
}

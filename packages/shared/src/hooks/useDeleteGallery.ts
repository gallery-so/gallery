import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useDeleteGalleryMutation } from '~/generated/useDeleteGalleryMutation.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

export default function useDeleteGallery() {
  const [deleteGallery] = usePromisifiedMutation<useDeleteGalleryMutation>(graphql`
    mutation useDeleteGalleryMutation($galleryId: DBID!) @raw_response_type {
      deleteGallery(galleryId: $galleryId) {
        ... on DeleteGalleryPayload {
          __typename
          deletedId {
            dbid
          }
        }

        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  return useCallback(
    (galleryId: string) => {
      return deleteGallery({
        updater: (store, response) => {
          if (
            response.deleteGallery?.__typename === 'DeleteGalleryPayload' &&
            response.deleteGallery.deletedId?.dbid
          ) {
            store.delete(`Gallery:${response.deleteGallery.deletedId.dbid}`);
          }
        },
        variables: {
          galleryId,
        },
      });
    },
    [deleteGallery]
  );
}

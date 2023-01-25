import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useUpdateGalleryOrderMutation } from '~/generated/useUpdateGalleryOrderMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

type GalleryPositionProps = Array<{
  galleryId: string;
  position: string;
}>;

export default function useUpdateGalleryOrder() {
  const [updateGalleryOrder] = usePromisifiedMutation<useUpdateGalleryOrderMutation>(graphql`
    mutation useUpdateGalleryOrderMutation($input: UpdateGalleryOrderInput!) @raw_response_type {
      updateGalleryOrder(input: $input) {
        ... on UpdateGalleryOrderPayload {
          viewer {
            id
            user {
              galleries {
                id
                position
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
    (positions: GalleryPositionProps) => {
      return updateGalleryOrder({
        variables: {
          input: {
            positions,
          },
        },
      });
    },
    [updateGalleryOrder]
  );
}

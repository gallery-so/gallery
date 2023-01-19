import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useUpdateGalleryHiddenMutation } from '~/generated/useUpdateGalleryHiddenMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useUpdateGalleryHidden() {
  const [updateGalleryHidden] = usePromisifiedMutation<useUpdateGalleryHiddenMutation>(graphql`
    mutation useUpdateGalleryHiddenMutation($input: UpdateGalleryHiddenInput!) @raw_response_type {
      updateGalleryHidden(input: $input) {
        ... on UpdateGalleryHiddenPayload {
          __typename
          gallery {
            __typename
            id
            hidden
          }
        }

        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  return useCallback(
    (id: string, hidden: boolean) => {
      const optimisticResponse: useUpdateGalleryHiddenMutation['response'] = {
        updateGalleryHidden: {
          __typename: 'UpdateGalleryHiddenPayload',
          gallery: {
            __typename: 'Gallery',
            id,
            hidden,
          },
        },
      };
      return updateGalleryHidden({
        variables: {
          input: {
            id,
            hidden,
          },
        },
        optimisticResponse,
      });
    },
    [updateGalleryHidden]
  );
}

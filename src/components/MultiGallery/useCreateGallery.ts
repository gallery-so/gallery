import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import { useCreateGalleryMutation } from '~/generated/useCreateGalleryMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useCreateGallery() {
  const [createGallery] = usePromisifiedMutation<useCreateGalleryMutation>(graphql`
    mutation useCreateGalleryMutation($input: CreateGalleryInput!) @raw_response_type {
      createGallery(input: $input) {
        ... on CreateGalleryPayload {
          gallery {
            id
          }
        }

        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  return useCallback(() => {
    return createGallery({
      variables: {
        input: {
          name: '',
          description: '',
          position: 'a1',
        },
      },
    });
  }, []);
}

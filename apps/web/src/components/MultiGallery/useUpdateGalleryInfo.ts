import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useUpdateGalleryInfoMutation } from '~/generated/useUpdateGalleryInfoMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

type Props = {
  id: string;
  name?: string;
  description?: string;
};

export default function useUpdateGalleryInfo() {
  const [updateGalleryInfo] = usePromisifiedMutation<useUpdateGalleryInfoMutation>(graphql`
    mutation useUpdateGalleryInfoMutation($input: UpdateGalleryInfoInput!) @raw_response_type {
      updateGalleryInfo(input: $input) {
        ... on UpdateGalleryInfoPayload {
          gallery {
            __typename
            id
            name
            description
          }
        }

        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  return useCallback(
    async ({ id, name, description }: Props) => {
      try {
        const response = await updateGalleryInfo({
          variables: {
            input: {
              id,
              name,
              description,
            },
          },
        });

        if (response?.updateGalleryInfo?.__typename === 'ErrInvalidInput') {
          throw new Error('The description you entered is too long.');
        }

        return response?.updateGalleryInfo?.gallery;
      } catch (error) {
        throw new Error('Failed to update gallery info');
      }
    },
    [updateGalleryInfo]
  );
}

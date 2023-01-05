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
    ({ id, name, description }: Props) => {
      return updateGalleryInfo({
        variables: {
          input: {
            id,
            name,
            description,
          },
        },
      });
    },
    [updateGalleryInfo]
  );
}

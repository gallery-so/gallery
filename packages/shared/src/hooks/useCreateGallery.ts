import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useCreateGalleryMutation } from '~/generated/useCreateGalleryMutation.graphql';

import { ValidationError } from '../errors/ValidationError';
import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

export default function useCreateGallery() {
  const [createGallery] = usePromisifiedMutation<useCreateGalleryMutation>(graphql`
    mutation useCreateGalleryMutation($input: CreateGalleryInput!) @raw_response_type {
      createGallery(input: $input) {
        ... on CreateGalleryPayload {
          gallery {
            id
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
    async (position: string, onSuccess: (galleryId: string) => void) => {
      try {
        const response = await createGallery({
          variables: {
            input: {
              name: '',
              description: '',
              position,
            },
          },
        });

        if (response?.createGallery?.__typename === 'ErrInvalidInput') {
          throw new ValidationError('The description you entered is too long.');
        }

        const galleryId = response?.createGallery?.gallery?.dbid;

        if (galleryId) {
          onSuccess(galleryId);
        }
      } catch (error) {
        throw new Error('Failed to create gallery');
      }
    },
    [createGallery]
  );
}

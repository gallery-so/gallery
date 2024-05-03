import { useCallback } from 'react';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';

import { useCreateGalleryMutation } from '~/generated/useCreateGalleryMutation.graphql';

import { ValidationError } from '../errors/ValidationError';
import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

export default function useCreateGallery() {
  const [createGallery] = usePromisifiedMutation<useCreateGalleryMutation>(graphql`
    mutation useCreateGalleryMutation($input: CreateGalleryInput!) @raw_response_type {
      createGallery(input: $input) {
        ... on CreateGalleryPayload {
          __typename
          gallery {
            __typename
            id
            dbid
            name
            description
            owner {
              id
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
    async (
      position: string,
      onSuccess: (galleryId: string) => void,
      updater?: SelectorStoreUpdater<useCreateGalleryMutation['response']>
    ) => {
      try {
        const response = await createGallery({
          updater,
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

        if (
          response.createGallery?.__typename === 'CreateGalleryPayload' &&
          response.createGallery?.gallery?.dbid
        ) {
          onSuccess(response.createGallery.gallery.dbid);
        }
      } catch (error) {
        throw new Error('Failed to create gallery');
      }
    },
    [createGallery]
  );
}

import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { ValidationError } from '~/errors/ValidationError';
import {
  useUpdateCollectionInfoMutation,
  useUpdateCollectionInfoMutation$data,
} from '~/generated/useUpdateCollectionInfoMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useUpdateCollectionInfo() {
  const [updateCollection, isMutating] =
    usePromisifiedMutation<useUpdateCollectionInfoMutation>(graphql`
      mutation useUpdateCollectionInfoMutation($input: UpdateCollectionInfoInput!) {
        updateCollectionInfo(input: $input) {
          __typename
          ... on ErrInvalidInput {
            message
          }
          ... on UpdateCollectionInfoPayload {
            collection {
              id
              name
              collectorsNote
            }
          }
        }
      }
    `);

  const mutate = useCallback(
    async (collectionDbid: string, name: string, collectorsNote: string) => {
      const optimisticResponse: useUpdateCollectionInfoMutation$data = {
        updateCollectionInfo: {
          __typename: 'UpdateCollectionInfoPayload',
          collection: {
            id: `Collection:${collectionDbid}`,
            name,
            collectorsNote,
          },
        },
      };

      const response = await updateCollection({
        optimisticResponse,
        variables: { input: { name, collectorsNote, collectionId: collectionDbid } },
      });

      if (response.updateCollectionInfo?.__typename === 'ErrInvalidInput') {
        throw new ValidationError('The description you entered is too long.');
      }
    },
    [updateCollection]
  );

  return [mutate, isMutating] as const;
}

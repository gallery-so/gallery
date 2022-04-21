import { useCallback } from 'react';
import {
  useUpdateCollectionInfoMutation,
  useUpdateCollectionInfoMutation$data,
} from '__generated__/useUpdateCollectionInfoMutation.graphql';
import { graphql } from 'react-relay';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';

export default function useUpdateCollectionInfo() {
  const [updateCollection] = usePromisifiedMutation<useUpdateCollectionInfoMutation>(graphql`
    mutation useUpdateCollectionInfoMutation($input: UpdateCollectionInfoInput!) {
      updateCollectionInfo(input: $input) {
        __typename
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

  return useCallback(
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

      await updateCollection({
        optimisticResponse,
        variables: { input: { name, collectorsNote, collectionId: collectionDbid } },
      });
    },
    [updateCollection]
  );
}

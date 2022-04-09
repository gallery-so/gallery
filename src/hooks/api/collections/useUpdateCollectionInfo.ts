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
            // We don't have the GraphQL / Relay ID here. So we'll generate it
            // the same way the backend does {TypeName}:{DBID} here so relay
            // can find the right item in the cache to update.
            id: `Collection:${collectionDbid}`,
            name,
            collectorsNote,
          },
        },
      };

      await updateCollection({
        // As soon as the mutation starts, immediately respond with this optmistic response
        // until the server tells us what the new information is.
        optimisticResponse,
        variables: { input: { name, collectorsNote, collectionId: collectionDbid } },
      });
    },
    [updateCollection]
  );
}

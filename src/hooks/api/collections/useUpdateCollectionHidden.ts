import { useCallback } from 'react';

import { graphql } from 'relay-runtime';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import {
  useUpdateCollectionHiddenMutation,
  useUpdateCollectionHiddenMutation$data,
} from '__generated__/useUpdateCollectionHiddenMutation.graphql';

export default function useUpdateCollectionHidden() {
  const [updateCollection] = usePromisifiedMutation<useUpdateCollectionHiddenMutation>(
    graphql`
      mutation useUpdateCollectionHiddenMutation($input: UpdateCollectionHiddenInput!) {
        updateCollectionHidden(input: $input) {
          __typename
          ... on UpdateCollectionHiddenPayload {
            collection {
              id
              hidden
            }
          }
        }
      }
    `
  );

  return useCallback(
    async (collectionId: string, hidden: boolean) => {
      const optimisticResponse: useUpdateCollectionHiddenMutation$data = {
        updateCollectionHidden: {
          __typename: 'UpdateCollectionHiddenPayload',
          collection: {
            id: `Collection:${collectionId}`,
            hidden,
          },
        },
      };

      await updateCollection({
        optimisticResponse,
        variables: { input: { collectionId, hidden } },
      });
    },
    [updateCollection]
  );
}

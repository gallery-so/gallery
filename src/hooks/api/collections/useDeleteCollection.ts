import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useDeleteCollectionMutation } from '~/generated/useDeleteCollectionMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export function useDeleteCollection() {
  // TODO: handle error cases
  const [deleteCollectionMutate] = usePromisifiedMutation<useDeleteCollectionMutation>(graphql`
    mutation useDeleteCollectionMutation($id: DBID!) {
      deleteCollection(collectionId: $id) {
        ... on DeleteCollectionPayload {
          gallery {
            collections {
              id
            }
          }
        }
      }
    }
  `);

  return useCallback(
    async (collectionId: string) => {
      await deleteCollectionMutate({ variables: { id: collectionId } });
    },
    [deleteCollectionMutate]
  );
}

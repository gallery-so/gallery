import { useCallback } from 'react';
import {
  UpdateCollectionRequest,
  UpdateCollectionResponse,
} from 'types/Collection';
import usePost from './rest/usePost';
import { useAuthenticatedUser } from './useUser';

export default function useUpdateCollection() {
  const updateCollection = usePost();
  const authenticatedUser = useAuthenticatedUser();

  return useCallback(
    async (collectionId: string, name: string, description: string) => {
      if (!authenticatedUser) return;

      const result = await updateCollection<
        UpdateCollectionResponse,
        UpdateCollectionRequest
      >('/collections/update/info', 'update collection', {
        id: collectionId,
        name: name,
        collectors_note: description,
      });

      return result;
    },
    [authenticatedUser, updateCollection]
  );
}

import { useCallback } from 'react';
import {
  UpdateCollectionInfoRequest,
  UpdateCollectionInfoResponse,
} from './types';
import usePost from '../_rest/usePost';
import { useAuthenticatedUser } from '../users/useUser';

export default function useUpdateCollectionInfo() {
  const updateCollection = usePost();
  const authenticatedUser = useAuthenticatedUser();

  return useCallback(
    async (collectionId: string, name: string, description: string) => {
      if (!authenticatedUser) return;

      const result = await updateCollection<
        UpdateCollectionInfoResponse,
        UpdateCollectionInfoRequest
      >('/collections/update/info', 'update collection info', {
        id: collectionId,
        name: name,
        collectors_note: description,
      });

      return result;
    },
    [authenticatedUser, updateCollection]
  );
}

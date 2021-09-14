import { useCallback } from 'react';
import usePost from '../_rest/usePost';
import { useAuthenticatedUser } from '../users/useUser';
import {
  UpdateCollectionNftsRequest,
  UpdateCollectionNftsResponse,
} from './types';

export default function useUpdateCollectionNfts() {
  const updateCollection = usePost();
  const authenticatedUser = useAuthenticatedUser();

  return useCallback(
    async (collectionId: string, nfts: string[]) => {
      if (!authenticatedUser) {
        return;
      }

      const result = await updateCollection<
      UpdateCollectionNftsResponse,
      UpdateCollectionNftsRequest
      >('/collections/update/nfts', 'update collection nfts', {
        id: collectionId,
        nfts,
      });

      return result;
    },
    [authenticatedUser, updateCollection],
  );
}

import { useCallback } from 'react';
import { mutate } from 'swr';
import usePost from '../_rest/usePost';
import { useAuthenticatedUser } from '../users/useUser';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { getUnassignedNftsCacheKey } from '../nfts/useUnassignedNfts';
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

      await mutate(getGalleriesCacheKey({ userId: authenticatedUser.id }));

      // waiting to invalidate the cache so that the user doesn't see the sidebar get cleared out
      // on invalidation
      setTimeout(() => {
        void mutate(getUnassignedNftsCacheKey({ userId: authenticatedUser.id }), null, false);
      }, 1000);

      return result;
    },
    [authenticatedUser, updateCollection],
  );
}

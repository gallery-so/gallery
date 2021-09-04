import cloneDeep from 'lodash.clonedeep';
import { useCallback } from 'react';
import { mutate } from 'swr';
import { Collection } from 'types/Collection';
import { GetGalleriesResponse } from '../galleries/types';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { useRefreshUnassignedNfts } from '../nfts/useUnassignedNfts';
import { useAuthenticatedUser } from '../users/useUser';
import usePost from '../_rest/usePost';
import { DeleteCollectionRequest, DeleteCollectionResponse } from './types';

export default function useDeleteCollection() {
  const deleteCollection = usePost();
  const authenticatedUser = useAuthenticatedUser();
  const refreshUnassignedNfts = useRefreshUnassignedNfts();

  return useCallback(
    async (collectionId: string) => {
      await deleteCollection<DeleteCollectionResponse, DeleteCollectionRequest>(
        '/collections/delete',
        'delete collection',
        {
          id: collectionId,
        }
      );

      await mutate(
        getGalleriesCacheKey({ userId: authenticatedUser.id }),
        (val: GetGalleriesResponse) => {
          const newVal = cloneDeep<GetGalleriesResponse>(val);
          const gallery = newVal.galleries[0];
          const newCollections = gallery.collections.filter(
            (collection: Collection) => collection.id !== collectionId
          );
          newVal.galleries[0].collections = newCollections;
          return newVal;
        },
        false
      );

      await refreshUnassignedNfts({ skipCache: true });
    },
    [authenticatedUser.id, deleteCollection, refreshUnassignedNfts]
  );
}

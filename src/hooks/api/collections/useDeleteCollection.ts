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
  const { id: userId } = useAuthenticatedUser();
  const refreshUnassignedNfts = useRefreshUnassignedNfts();

  return useCallback(
    async (collectionId: string) => {
      await deleteCollection<DeleteCollectionResponse, DeleteCollectionRequest>(
        '/collections/delete',
        'delete collection',
        {
          id: collectionId,
        },
      );

      await mutate(
        getGalleriesCacheKey({ userId }),
        (value: GetGalleriesResponse) => {
          const newValue = cloneDeep<GetGalleriesResponse>(value);
          const gallery = newValue.galleries[0];
          const newCollections = gallery.collections.filter(
            (collection: Collection) => collection.id !== collectionId,
          );
          newValue.galleries[0].collections = newCollections;
          return newValue;
        },
        false,
      );

      await refreshUnassignedNfts();
    },
    [userId, deleteCollection, refreshUnassignedNfts],
  );
}

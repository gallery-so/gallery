import { useCallback } from 'react';
import {
  UpdateCollectionInfoRequest,
  UpdateCollectionInfoResponse,
} from './types';
import usePost from '../_rest/usePost';
import { useAuthenticatedUser } from '../users/useUser';
import { mutate } from 'swr';
import { GetGalleriesResponse } from '../galleries/types';
import cloneDeep from 'lodash.clonedeep';
import { getGalleriesCacheKey } from '../galleries/useGalleries';

export default function useUpdateCollectionInfo() {
  const updateCollection = usePost();
  const authenticatedUser = useAuthenticatedUser();

  return useCallback(
    async (collectionId: string, name: string, collectors_note: string) => {
      const result = await updateCollection<
        UpdateCollectionInfoResponse,
        UpdateCollectionInfoRequest
      >('/collections/update/info', 'update collection info', {
        id: collectionId,
        name: name,
        collectors_note,
      });

      // optimistically update the collection within gallery cache.
      // it should be less messy in the future when we have a dedicated
      // endpoint for individual collections
      mutate(
        getGalleriesCacheKey({ userId: authenticatedUser.id }),
        (val: GetGalleriesResponse) => {
          const newVal = cloneDeep<GetGalleriesResponse>(val);
          const gallery = newVal.galleries[0];
          const newCollections = gallery.collections.map((collection) => {
            if (collection.id === collectionId) {
              return { ...collection, name, collectors_note };
            }
            return collection;
          });
          newVal.galleries[0].collections = newCollections;
          return newVal;
        },
        false
      );

      return result;
    },
    [authenticatedUser, updateCollection]
  );
}

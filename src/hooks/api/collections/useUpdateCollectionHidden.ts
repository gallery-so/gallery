import { useCallback } from 'react';
import {
  UpdateCollectionHiddenRequest,
  UpdateCollectionHiddenResponse,
} from './types';
import usePost from '../_rest/usePost';
import { useAuthenticatedUser } from '../users/useUser';
import { mutate } from 'swr';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { GetGalleriesResponse } from '../galleries/types';
import cloneDeep from 'lodash.clonedeep';

export default function useUpdateCollectionHidden() {
  const updateCollection = usePost();
  const authenticatedUser = useAuthenticatedUser();

  return useCallback(
    async (collectionId: string, hidden: boolean) => {
      await updateCollection<
        UpdateCollectionHiddenResponse,
        UpdateCollectionHiddenRequest
      >('/collections/update/hidden', 'update collection hidden', {
        id: collectionId,
        hidden,
      });

      // optimistically update the collection within gallery cache.
      // it should be less messy in the future when we have a dedicated
      // endpoint for individual collections
      await mutate(
        getGalleriesCacheKey({ userId: authenticatedUser.id }),
        (val: GetGalleriesResponse) => {
          const newVal = cloneDeep<GetGalleriesResponse>(val);
          const gallery = newVal.galleries[0];
          const newCollections = gallery.collections.map((collection) => {
            if (collection.id === collectionId) {
              return { ...collection, hidden };
            }
            return collection;
          });
          newVal.galleries[0].collections = newCollections;
          return newVal;
        },
        false
      );
    },
    [updateCollection, authenticatedUser]
  );
}

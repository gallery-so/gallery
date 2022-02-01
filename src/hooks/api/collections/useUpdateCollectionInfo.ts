import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import cloneDeep from 'lodash.clonedeep';
import usePost from '../_rest/usePost';
import { useAuthenticatedUser } from '../users/useUser';
import { GetGalleriesResponse } from '../galleries/types';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { GetCollectionResponse, UpdateCollectionInfoRequest, UpdateCollectionInfoResponse } from './types';
import { getISODate } from 'utils/time';
import { getCollectionByIdCacheKey } from './useCollectionById';

export default function useUpdateCollectionInfo() {
  const updateCollection = usePost();
  const authenticatedUser = useAuthenticatedUser();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (collectionId: string, name: string, collectors_note: string) => {
      await updateCollection<UpdateCollectionInfoResponse, UpdateCollectionInfoRequest>(
        '/collections/update/info',
        'update collection info',
        {
          id: collectionId,
          name,
          collectors_note,
        }
      );

      // Optimistically update the collection within gallery cache.
      // it should be less messy in the future when we have a dedicated
      // endpoint for individual collections
      await mutate(
        getGalleriesCacheKey({ userId: authenticatedUser.id }),
        (value: GetGalleriesResponse) => {
          const newValue = cloneDeep<GetGalleriesResponse>(value);
          const gallery = newValue.galleries[0];
          const newCollections = gallery.collections.map((collection) => {
            if (collection.id === collectionId) {
              return { ...collection, name, collectors_note };
            }

            return collection;
          });
          gallery.collections = newCollections;
          gallery.last_updated = getISODate();
          return newValue;
        },
        false
      );


      // Update single collection cache
      await mutate(
        getCollectionByIdCacheKey({ id: collectionId }),
        (value: GetCollectionResponse) => {
          const newValue = cloneDeep<any>(value);
          newValue.collection.name = name;
          newValue.collection.collectors_note = collectors_note;
          return newValue
        },
        false
      );
    },
    [authenticatedUser.id, mutate, updateCollection]
  );
}

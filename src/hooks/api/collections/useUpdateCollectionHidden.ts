import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import cloneDeep from 'lodash.clonedeep';
import usePost from '../_rest/usePost';
import { useAuthenticatedUser } from '../users/useUser';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { GetGalleriesResponse } from '../galleries/types';
import { UpdateCollectionHiddenRequest, UpdateCollectionHiddenResponse } from './types';
import { getISODate } from 'utils/time';

import { commitLocalUpdate } from 'relay-runtime';
import { useRelayEnvironment } from 'react-relay';

export default function useUpdateCollectionHidden() {
  const relayEnvironment = useRelayEnvironment();
  const updateCollection = usePost();
  const authenticatedUser = useAuthenticatedUser();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (collectionId: string, hidden: boolean) => {
      await updateCollection<UpdateCollectionHiddenResponse, UpdateCollectionHiddenRequest>(
        '/collections/update/hidden',
        'update collection hidden',
        {
          id: collectionId,
          hidden,
        }
      );

      commitLocalUpdate(relayEnvironment, (store) => {
        const collection = store.get(`GalleryCollection:${collectionId}`);

        collection?.setValue(hidden, 'hidden');
      });

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
              return { ...collection, hidden };
            }

            return collection;
          });
          gallery.collections = newCollections;
          gallery.last_updated = getISODate();
          return newValue;
        },
        false
      );
    },
    [updateCollection, mutate, authenticatedUser.id, relayEnvironment]
  );
}

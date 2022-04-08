import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import cloneDeep from 'lodash.clonedeep';
import { useAuthenticatedUser } from '../users/useUser';
import { GetGalleriesResponse } from '../galleries/types';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { GetCollectionResponse } from './types';
import {
  useUpdateCollectionInfoMutation,
  useUpdateCollectionInfoMutation$data,
} from '__generated__/useUpdateCollectionInfoMutation.graphql';
import { getISODate } from 'utils/time';
import { getCollectionByIdCacheKey } from './useCollectionById';
import { graphql } from 'react-relay';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';

export default function useUpdateCollectionInfo() {
  const { mutate } = useSWRConfig();
  const authenticatedUser = useAuthenticatedUser();

  const [updateCollection] = usePromisifiedMutation<useUpdateCollectionInfoMutation>(graphql`
    mutation useUpdateCollectionInfoMutation($input: UpdateCollectionInfoInput!) {
      updateCollectionInfo(input: $input) {
        __typename
        ... on UpdateCollectionInfoPayload {
          collection {
            id
            name
            collectorsNote
          }
        }
      }
    }
  `);

  return useCallback(
    async (collectionDbid: string, name: string, collectorsNote: string) => {
      const optimisticResponse: useUpdateCollectionInfoMutation$data = {
        updateCollectionInfo: {
          __typename: 'UpdateCollectionInfoPayload',
          collection: {
            // We don't have the GraphQL / Relay ID here. So we'll generate it
            // the same way the backend does {TypeName}:{DBID} here so relay
            // can find the right item in the cache to update.
            id: `Collection:${collectionDbid}`,
            name,
            collectorsNote,
          },
        },
      };

      await updateCollection({
        // As soon as the mutation starts, immediately respond with this optmistic response
        // until the server tells us what the new information is.
        optimisticResponse,
        variables: { input: { name, collectorsNote, collectionId: collectionDbid } },
      });

      /* The following two SWR optimistic updates are here until we fully */
      /* remove collections / galleries from SWR                          */

      // Optimistically update the collection within gallery cache.
      // it should be less messy in the future when we have a dedicated
      // endpoint for individual collections
      await mutate(
        getGalleriesCacheKey({ userId: authenticatedUser.id }),
        (value: GetGalleriesResponse) => {
          const newValue = cloneDeep<GetGalleriesResponse>(value);
          const gallery = newValue.galleries[0];
          const newCollections = gallery.collections.map((collection) => {
            if (collection.id === collectionDbid) {
              return { ...collection, name, collectors_note: collectorsNote };
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
        getCollectionByIdCacheKey({ id: collectionDbid }),
        (value: GetCollectionResponse) => {
          const newValue = cloneDeep<GetCollectionResponse | undefined>(value);

          // only mutate if collection resource exists in cache
          if (newValue) {
            newValue.collection.name = name;
            newValue.collection.collectors_note = collectorsNote;
          }

          return newValue;
        },
        false
      );
    },
    [authenticatedUser.id, mutate, updateCollection]
  );
}

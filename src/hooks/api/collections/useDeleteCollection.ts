import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import cloneDeep from 'lodash.clonedeep';
import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { useSWRConfig } from 'swr';
import { Collection } from 'types/Collection';
import { getISODate } from 'utils/time';
import { useDeleteCollectionMutation } from '__generated__/useDeleteCollectionMutation.graphql';
import { GetGalleriesResponse } from '../galleries/types';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { useAuthenticatedUser } from '../users/useUser';

export default function useDeleteCollection() {
  const { id: userId } = useAuthenticatedUser();
  const { mutate } = useSWRConfig();

  // TODO: handle error cases
  const [deleteCollectionMutate] = usePromisifiedMutation<useDeleteCollectionMutation>(graphql`
    mutation useDeleteCollectionMutation($id: DBID!) {
      deleteCollection(collectionId: $id) {
        ... on DeleteCollectionPayload {
          gallery {
            collections {
              id
            }
          }
        }
      }
    }
  `);

  return useCallback(
    async (collectionId: string) => {
      await deleteCollectionMutate({ variables: { id: collectionId } });

      await mutate(
        getGalleriesCacheKey({ userId }),
        (value: GetGalleriesResponse) => {
          const newValue = cloneDeep<GetGalleriesResponse>(value);
          const gallery = newValue.galleries[0];
          const newCollections = gallery.collections.filter(
            (collection: Collection) => collection.id !== collectionId
          );
          gallery.collections = newCollections;
          gallery.last_updated = getISODate();
          return newValue;
        },
        false
      );
    },
    [deleteCollectionMutate, mutate, userId]
  );
}

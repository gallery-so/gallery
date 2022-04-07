import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import cloneDeep from 'lodash.clonedeep';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import { useSWRConfig } from 'swr';
import { Collection } from 'types/Collection';
import { getISODate } from 'utils/time';
import { useAuthenticatedUser } from '../users/useUser';
import { GetGalleriesResponse } from './types';
import { getGalleriesCacheKey } from './useGalleries';
import {
  useUpdateGalleryMutation,
  useUpdateGalleryMutation$data,
} from '__generated__/useUpdateGalleryMutation.graphql';

function mapCollectionsToCollectionIds(collections: Collection[]) {
  return collections.map((collection) => collection.id);
}

export default function useUpdateGallery() {
  const authenticatedUser = useAuthenticatedUser();
  const { mutate } = useSWRConfig();
  const [updateGallery] = usePromisifiedMutation<useUpdateGalleryMutation>(graphql`
    mutation useUpdateGalleryMutation($input: UpdateGalleryCollectionsInput!) {
      updateGalleryCollections(input: $input) {
        __typename
        ... on UpdateGalleryCollectionsPayload {
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
    async (galleryId: string, collections: Collection[]) => {
      const optimisticResponse: useUpdateGalleryMutation$data = {
        updateGalleryCollections: {
          __typename: 'UpdateGalleryCollectionsPayload',
          gallery: {
            collections: collections.map((collection) => ({ id: collection.id })),
          },
        },
      };

      await updateGallery({
        optimisticResponse,
        variables: {
          input: {
            galleryId,
            collections: mapCollectionsToCollectionIds(collections),
          },
        },
      });

      void mutate(
        getGalleriesCacheKey({ userId: authenticatedUser.id }),
        (value: GetGalleriesResponse) => {
          const newValue = cloneDeep<GetGalleriesResponse>(value);
          newValue.galleries[0].collections = collections;
          newValue.galleries[0].last_updated = getISODate();
          return newValue;
        },
        false
      );
    },
    [authenticatedUser.id, mutate, updateGallery]
  );
}

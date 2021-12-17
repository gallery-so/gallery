import { useCallback } from 'react';
import cloneDeep from 'lodash.clonedeep';
import { useSWRConfig } from 'swr';
import { Collection, CollectionLayout } from 'types/Collection';
import usePost from '../_rest/usePost';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { useAuthenticatedUser } from '../users/useUser';
import { CreateCollectionRequest, CreateCollectionResponse } from './types';
import { Nft } from 'types/Nft';
import { GetGalleriesResponse } from '../galleries/types';
import { getISODate } from 'utils/time';

export default function useCreateCollection() {
  const createCollection = usePost();
  const { id: userId } = useAuthenticatedUser();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (
      galleryId: string,
      title: string,
      description: string,
      nfts: Nft[],
      collectionLayout: CollectionLayout
    ) => {
      const nftIds = nfts.map((nft) => nft.id);
      const result = await createCollection<CreateCollectionResponse, CreateCollectionRequest>(
        '/collections/create',
        'create collection',
        {
          gallery_id: galleryId,
          name: title,
          collectors_note: description,
          nfts: nftIds,
          layout: collectionLayout,
        }
      );

      const now = getISODate();

      const optimisticallyCreatedCollection: Collection = {
        version: 0,
        created_at: now,
        last_updated: now,
        id: result.collection_id,
        name: title,
        collectors_note: description,
        hidden: false,
        owner_user_id: userId,
        nfts,
        layout: collectionLayout,
      };

      await mutate(
        getGalleriesCacheKey({ userId }),
        (value: GetGalleriesResponse) => {
          const newValue = cloneDeep<GetGalleriesResponse>(value);
          const gallery = newValue.galleries[0];
          const newCollections = [...gallery.collections, optimisticallyCreatedCollection];
          gallery.collections = newCollections;
          gallery.last_updated = now;
          return newValue;
        },
        false
      );

      return result;
    },
    [createCollection, mutate, userId]
  );
}

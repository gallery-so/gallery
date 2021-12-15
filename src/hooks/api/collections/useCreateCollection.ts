import { useCallback } from 'react';
import cloneDeep from 'lodash.clonedeep';
import { mutate } from 'swr';
import { Collection, CollectionLayout } from 'types/Collection';
import usePost from '../_rest/usePost';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { useAuthenticatedUser } from '../users/useUser';
import { CreateCollectionRequest, CreateCollectionResponse } from './types';
import { Nft } from 'types/Nft';
import { GetGalleriesResponse } from '../galleries/types';

export default function useCreateCollection() {
  const createCollection = usePost();
  const { id: userId } = useAuthenticatedUser();

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

      const optimisticallyCreatedCollection: Collection = {
        version: 0,
        id: result.collection_id,
        name: title,
        collectors_note: description,
        hidden: false,
        // TODO: update according to what the server is using
        created_at: Date.now(),
        // TODO: update according to what the server is using
        last_updated: Date.now(),
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
          newValue.galleries[0].collections = newCollections;
          return newValue;
        },
        false
      );

      return result;
    },
    [createCollection, userId]
  );
}

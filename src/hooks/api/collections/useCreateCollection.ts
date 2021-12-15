import { useCallback } from 'react';
import { mutate } from 'swr';
import { CollectionLayout } from 'types/Collection';
import usePost from '../_rest/usePost';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { useAuthenticatedUser } from '../users/useUser';
import { CreateCollectionRequest, CreateCollectionResponse } from './types';

export default function useCreateCollection() {
  const createCollection = usePost();
  const authenticatedUser = useAuthenticatedUser();

  return useCallback(
    async (
      galleryId: string,
      title: string,
      description: string,
      nftIds: string[],
      collectionLayout: CollectionLayout
    ) => {
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

      await mutate(getGalleriesCacheKey({ userId: authenticatedUser.id }));

      return result;
    },
    [createCollection, authenticatedUser]
  );
}

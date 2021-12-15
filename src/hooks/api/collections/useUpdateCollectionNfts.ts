import { useCallback } from 'react';
import cloneDeep from 'lodash.clonedeep';
import { mutate } from 'swr';
import { CollectionLayout } from 'types/Collection';
import usePost from '../_rest/usePost';
import { useAuthenticatedUser } from '../users/useUser';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { UpdateCollectionNftsRequest, UpdateCollectionNftsResponse } from './types';
import { Nft } from 'types/Nft';
import { GetGalleriesResponse } from '../galleries/types';

export default function useUpdateCollectionNfts() {
  const updateCollection = usePost();
  const { id: userId } = useAuthenticatedUser();

  return useCallback(
    async (collectionId: string, nfts: Nft[], layout: CollectionLayout) => {
      const nftIds = nfts.map((nft) => nft.id);
      const result = await updateCollection<
        UpdateCollectionNftsResponse,
        UpdateCollectionNftsRequest
      >('/collections/update/nfts', 'update collection nfts', {
        id: collectionId,
        nfts: nftIds,
        layout,
      });

      await mutate(
        getGalleriesCacheKey({ userId }),
        (value: GetGalleriesResponse) => {
          const newValue = cloneDeep<GetGalleriesResponse>(value);
          const gallery = newValue.galleries[0];
          const newCollections = gallery.collections.map((collection) => {
            if (collection.id === collectionId) {
              return { ...collection, last_updated: Date.now(), nfts, layout };
            }

            return collection;
          });
          newValue.galleries[0].collections = newCollections;
          return newValue;
        },
        false
      );

      return result;
    },
    [userId, updateCollection]
  );
}

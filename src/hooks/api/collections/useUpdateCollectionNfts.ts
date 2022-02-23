import { useCallback } from 'react';
import cloneDeep from 'lodash.clonedeep';
import { useSWRConfig } from 'swr';
import { CollectionLayout } from 'types/Collection';
import usePost from '../_rest/usePost';
import { useAuthenticatedUser } from '../users/useUser';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { UpdateCollectionNftsRequest, UpdateCollectionNftsResponse } from './types';
import { GetGalleriesResponse } from '../galleries/types';
import { getISODate } from 'utils/time';
import { EditModeNft } from 'flows/shared/steps/OrganizeCollection/types';
import {
  getWhitespacePositionsFromStagedNfts,
  removeWhitespacesFromStagedNfts,
} from 'utils/collectionLayout';

export default function useUpdateCollectionNfts() {
  const updateCollection = usePost();
  const { id: userId } = useAuthenticatedUser();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (collectionId: string, stagedNfts: EditModeNft[], collectionLayout: CollectionLayout) => {
      const layout = {
        ...collectionLayout,
        whitespace: getWhitespacePositionsFromStagedNfts(stagedNfts),
      };
      const nfts = removeWhitespacesFromStagedNfts(stagedNfts);
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

          const now = getISODate();
          const newCollections = gallery.collections.map((collection) => {
            if (collection.id === collectionId) {
              return { ...collection, last_updated: now, nfts, layout };
            }

            return collection;
          });
          gallery.collections = newCollections;
          gallery.last_updated = now;
          return newValue;
        },
        false
      );

      return result;
    },
    [updateCollection, mutate, userId]
  );
}

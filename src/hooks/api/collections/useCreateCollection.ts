import { useCallback } from 'react';
import cloneDeep from 'lodash.clonedeep';
import { useSWRConfig } from 'swr';
import { Collection, CollectionLayout } from 'types/Collection';
import usePost from '../_rest/usePost';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { useAuthenticatedUser } from '../users/useUser';
import { CreateCollectionRequest, CreateCollectionResponse } from './types';
import { GetGalleriesResponse } from '../galleries/types';
import { getISODate } from 'utils/time';
import { StagingItem } from 'flows/shared/steps/OrganizeCollection/types';
import {
  getWhitespacePositionsFromStagedItems,
  removeWhitespacesFromStagedItems,
} from 'utils/collectionLayout';

export default function useCreateCollection() {
  const createCollection = usePost();
  const { id: userId } = useAuthenticatedUser();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (
      galleryId: string,
      title: string,
      description: string,
      stagedNfts: StagingItem[],
      collectionLayout: CollectionLayout
    ) => {
      const layout = {
        ...collectionLayout,
        whitespace: getWhitespacePositionsFromStagedItems(stagedNfts),
      };
      const nfts = removeWhitespacesFromStagedItems(stagedNfts);
      const nftIds = nfts.map((nft) => nft.id);
      const result = await createCollection<CreateCollectionResponse, CreateCollectionRequest>(
        '/collections/create',
        'create collection',
        {
          gallery_id: galleryId,
          name: title,
          collectors_note: description,
          nfts: nftIds,
          layout,
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
        layout,
      };

      await mutate(
        getGalleriesCacheKey({ userId }),
        (value: GetGalleriesResponse) => {
          const newValue = cloneDeep<GetGalleriesResponse>(value);
          const gallery = newValue.galleries[0];
          const newCollections = [optimisticallyCreatedCollection, ...gallery.collections];
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

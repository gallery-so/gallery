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
import { fetchQuery, graphql } from 'relay-runtime';
import { useRelayEnvironment } from 'react-relay';
import { useCreateCollectionQuery } from '__generated__/useCreateCollectionQuery.graphql';

export default function useCreateCollection() {
  const createCollection = usePost();
  const { id: userId } = useAuthenticatedUser();
  const { mutate } = useSWRConfig();
  const relayEnvironment = useRelayEnvironment();

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

      // Until everything is routed through GraphQL, we need
      // a mechanism to ensure that other pages using this data
      // get the updated data.
      //
      // This fetchQuery asks the server for a collection.
      // We're also ensuring that any other pages that need data
      // off of a collection are getting their data requirements
      // refreshed. These four fragments are the only fragmeents
      // on this type, so we should be good.
      //
      // If you want to ensure this list of fragments is up to date
      // you can global search for `on Gallery ` to find
      // all of the fragments on this type.
      //
      // In other places, we can do an optimistic update since
      // there's not much data to update (hidden, collectorsNote, etc).
      // Here, we'd have to optimistically update a bunch of nfts which
      // is more risky since that mapping logic might get out of hand.
      // The safer approach here is to just refetch the data.
      await fetchQuery<useCreateCollectionQuery>(
        relayEnvironment,
        graphql`
          query useCreateCollectionQuery($id: DBID!) {
            collectionById(id: $id) {
              ... on GalleryCollection {
                gallery {
                  ...UserGalleryCollectionsFragment
                }
              }
            }
          }
        `,
        { id: result.collection_id }
      ).toPromise();

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
    [createCollection, mutate, relayEnvironment, userId]
  );
}

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
import { StagingItem } from 'flows/shared/steps/OrganizeCollection/types';
import {
  getWhitespacePositionsFromStagedItems,
  removeWhitespacesFromStagedItems,
} from 'utils/collectionLayout';
import { fetchQuery, graphql } from 'relay-runtime';
import { useRelayEnvironment } from 'react-relay';
import { useUpdateCollectionNftsRefreshserQuery } from '__generated__/useUpdateCollectionNftsRefreshserQuery.graphql';

export default function useUpdateCollectionNfts() {
  const relayEnvironment = useRelayEnvironment();
  const updateCollection = usePost();
  const { id: userId } = useAuthenticatedUser();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (collectionId: string, stagedNfts: StagingItem[], collectionLayout: CollectionLayout) => {
      const layout = {
        ...collectionLayout,
        whitespace: getWhitespacePositionsFromStagedItems(stagedNfts),
      };
      const nfts = removeWhitespacesFromStagedItems(stagedNfts);
      const nftIds = nfts.map((nft) => nft.id);
      const result = await updateCollection<
        UpdateCollectionNftsResponse,
        UpdateCollectionNftsRequest
      >('/collections/update/nfts', 'update collection nfts', {
        id: collectionId,
        nfts: nftIds,
        layout,
      });

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
      // you can global search for `on GalleryCollection` to find
      // all of the fragments on this type.
      //
      // In other places, we can do an optimistic update since
      // there's not much data to update (hidden, collectorsNote, etc).
      // Here, we'd have to optimistically update a bunch of nfts which
      // is more risky since that mapping logic might get out of hand.
      // The safer approach here is to just refetch the data.
      await fetchQuery<useUpdateCollectionNftsRefreshserQuery>(
        relayEnvironment,
        graphql`
          query useUpdateCollectionNftsRefreshserQuery($id: DBID!) {
            collectionById(id: $id) {
              ...UserGalleryCollectionFragment
              ...NftGalleryFragment
              ...useCollectionColumnsFragment
              ...CollectionGalleryHeaderFragment
            }
          }
        `,
        {
          id: collectionId,
        }
      ).toPromise();

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
    [updateCollection, mutate, userId, relayEnvironment]
  );
}

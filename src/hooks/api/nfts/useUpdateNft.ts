import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import cloneDeep from 'lodash.clonedeep';
import usePost from '../_rest/usePost';
import { useAuthenticatedUser } from '../users/useUser';
import { GetGalleriesResponse } from '../galleries/types';
import { getGalleriesCacheKey } from '../galleries/useGalleries';
import { UpdateNftInfoRequest, UpdateNftInfoResponse } from './types';
import { getISODate } from 'utils/time';

export default function useUpdateNft() {
  const updateNft = usePost();
  const authenticatedUser = useAuthenticatedUser();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (nftId: string, collectorsNote: string) => {
      console.log('Hello from NFT ' + nftId + ': ' + collectorsNote);
      //   await updateNft<UpdateNftInfoResponse, UpdateNftInfoRequest>(
      //     // TODO: Make this real
      //     `/nfts/${nftId}/update/info`,
      //     'update nft info',
      //     {
      //       nftId,
      //       collectorsNote,
      //     }
      //   );

      // Optimistically update the collection within gallery cache.
      // it should be less messy in the future when we have a dedicated
      // endpoint for individual collections
      //   await mutate(
      //     getGalleriesCacheKey({ userId: authenticatedUser.id }),
      //     (value: GetGalleriesResponse) => {
      //       const newValue = cloneDeep<GetGalleriesResponse>(value);
      //       const gallery = newValue.galleries[0];
      //       const newCollections = gallery.collections.map((collection) => {
      //         if (collection.id === collectionId) {
      //           return { ...collection, name, collectors_note };
      //         }

      //         return collection;
      //       });
      //       gallery.collections = newCollections;
      //       gallery.last_updated = getISODate();
      //       return newValue;
      //     },
      //     false
      //   );
    },
    [authenticatedUser.id, mutate, updateNft]
  );
}

import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import usePost from '../_rest/usePost';
import { getNftCacheKey } from './useNft';
import { UpdateNftInfoRequest, UpdateNftInfoResponse } from './types';

export default function useUpdateNft() {
  const updateNft = usePost();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (nftId: string, collectorsNote: string) => {
      await updateNft<UpdateNftInfoResponse, UpdateNftInfoRequest>(
        `/nfts/update`,
        'update nft info',
        {
          id: nftId,
          collectors_note: collectorsNote,
        }
      );

      await mutate(getNftCacheKey({ id: nftId }));
    },
    [mutate, updateNft]
  );
}

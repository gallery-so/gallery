import useFetcher from 'contexts/swr/useFetcher';
import { useCallback } from 'react';
import { Nft } from 'types/Nft';
import useGet from '../_rest/useGet';
import usePost from '../_rest/usePost';

export type OpenseaSyncResponse = {
  nfts: Nft[];
};

const getOpenseaSyncBaseUrl = '/nfts/opensea/get';
const getOpenseaSyncAction = 'fetch and sync nfts';

export default function useOpenseaSync(): Nft[] | undefined {
  const data = useGet<OpenseaSyncResponse>(
    `${getOpenseaSyncBaseUrl}`,
    getOpenseaSyncAction,
  );

  return data?.nfts;
}

export function getOpenseaSyncCacheKey() {
  return [
    getOpenseaSyncBaseUrl,
    getOpenseaSyncAction,
  ];
}

// use this hook to trigger backend to resync nfts with opensea
export function useRefreshOpenseaSync() {
  const refreshOpenseaSync = usePost();
  const fetcher = useFetcher();

  return useCallback(
    async () => {
      await refreshOpenseaSync('/nfts/opensea/refresh', 'refresh opensea nfts', {});
      const result = await fetcher(getOpenseaSyncBaseUrl, getOpenseaSyncAction);
      return result;
    }, [fetcher, refreshOpenseaSync],
  );
}

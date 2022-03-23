import useFetcher from 'contexts/swr/useFetcher';
import { useCallback } from 'react';

const getOpenseaSyncBaseUrl = '/nfts/opensea/get';
const getOpenseaSyncAction = 'fetch and sync nfts';

// use this hook to trigger backend to resync nfts with opensea
export function useRefreshOpenseaSync() {
  const fetcher = useFetcher();

  return useCallback(async () => {
    const result = await fetcher(getOpenseaSyncBaseUrl, getOpenseaSyncAction);
    return result;
  }, [fetcher]);
}

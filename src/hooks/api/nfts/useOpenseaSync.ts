import useFetcher from 'contexts/swr/useFetcher';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

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

export default function useRefreshOpenseaData() {
  const [refresh] = usePromisifiedMutation<any>(
    graphql`
      mutation useOpenseaSyncMutation($addresses: String!) {
        refreshOpenSeaNfts(addresses: $addresses) {
          __typename
          ... on ErrOpenseaSyncFailure {
            message
          }
        }
      }
    `
  );

  return useCallback(
    async (addresses: string) => {
      return await refresh({ variables: addresses });
    },
    [refresh]
  );
}

import { useCallback } from 'react';
import { mutate } from 'swr';
import { Nft } from 'types/Nft';
import { useAuthenticatedUserAddresses } from '../users/useUser';
import useGet from '../_rest/useGet';

type Props = {
  address?: string;
  skipCache?: boolean;
};

export type OpenseaSyncResponse = {
  nfts: Nft[];
};

const getOpenseaSyncBaseUrl = '/nfts/opensea_get';
const getOpenseaSyncAction = 'fetch and sync nfts';

export default function useOpenseaSync({ address, skipCache = false }: Props): Nft[] | undefined {
  const data = useGet<OpenseaSyncResponse>(
    `${getOpenseaSyncBaseUrl}?addresses=${address}&skip_cache=${skipCache}`,
    getOpenseaSyncAction,
  );

  return data?.nfts;
}

type QueryProps = {
  addresses: string[];
  skipCache: boolean;
};

export function getOpenseaSyncBaseUrlWithQuery({ addresses, skipCache }: QueryProps) {
  return `${getOpenseaSyncBaseUrl}?addresses=${addresses.join(',')}&skip_cache=${skipCache}`;
}

export function getOpenseaSyncCacheKey({ addresses, skipCache }: QueryProps) {
  return [
    getOpenseaSyncBaseUrlWithQuery({ addresses, skipCache }),
    getOpenseaSyncAction,
  ];
}

export function useRefreshOpenseaSync() {
  const addresses = useAuthenticatedUserAddresses();
  return useCallback(
    async ({ skipCache = false }: Props) => {
      await mutate(getOpenseaSyncCacheKey({ addresses, skipCache }));
    }, [addresses],
  );
}

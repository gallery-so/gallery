import { useCallback } from 'react';
import { mutate } from 'swr';
import { Nft } from 'types/Nft';
import { useAuthenticatedUser } from '../users/useUser';
import useGet from '../_rest/useGet';
import usePost from '../_rest/usePost';

type UnassignedNftsResponse = {
  nfts: Nft[];
};

const getUnassignedNftsAction = 'fetch unassigned nfts';

const getUnassignedNftsBaseUrl = '/nfts/unassigned/get';

type QueryProps = {
  userId: string;
};

function getUnassignedNftsBaseUrlWithQuery({ userId }: QueryProps) {
  return `${getUnassignedNftsBaseUrl}?user_id=${userId}`;
}

export function getUnassignedNftsCacheKey({ userId }: QueryProps) {
  return [getUnassignedNftsBaseUrlWithQuery({ userId }), getUnassignedNftsAction];
}

export const unassignedNftsAction = 'fetch unassigned nfts';

export default function useUnassignedNfts(): Nft[] | undefined {
  const user = useAuthenticatedUser();

  const data = useGet<UnassignedNftsResponse>(
    getUnassignedNftsBaseUrlWithQuery({ userId: user.id }),
    unassignedNftsAction
  );

  return data?.nfts;
}

// use this hook to force SWR to refetch unassigned nfts from the redis cache
export function useMutateUnassignedNftsCache() {
  const { id: userId } = useAuthenticatedUser();

  return useCallback(async () => {
    await mutate(getUnassignedNftsCacheKey({ userId }));
  }, [userId]);
}

// use this hook to refresh the redis cache of unassigned nfts
export function useRefreshUnassignedNfts() {
  const refreshUnassignedNfts = usePost();

  return useCallback(async () => {
    const result = await refreshUnassignedNfts(
      '/nfts/unassigned/refresh',
      'refresh unassigned nfts',
      {}
    );
    return result;
  }, [refreshUnassignedNfts]);
}

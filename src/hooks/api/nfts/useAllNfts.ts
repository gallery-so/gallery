import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { Nft } from 'types/Nft';
import { useAuthenticatedUser } from '../users/useUser';
import useGet from '../_rest/useGet';

type GetAllNFtsResponse = {
  nfts: Nft[];
};

type QueryProps = {
  userId: string;
};

const getAllNftsAction = 'fetch all nfts';

function getAllNftsCacheKey({ userId }: QueryProps) {
  return [`/nfts/user_get?user_id=${userId}`, getAllNftsAction];
}

export default function useAllNfts(): Nft[] {
  const user = useAuthenticatedUser();
  const data = useGet<GetAllNFtsResponse>(`/nfts/user_get?user_id=${user.id}`, getAllNftsAction);

  if (!data) {
    throw new Error(`No NFTs were found for user id: ${user.id}`);
  }

  return data.nfts || [];
}

// use this hook to force SWR to refetch all nfts for user
export function useMutateAllNftsCache() {
  const { id: userId } = useAuthenticatedUser();
  const { mutate } = useSWRConfig();

  return useCallback(async () => {
    await mutate(getAllNftsCacheKey({ userId }));
  }, [mutate, userId]);
}

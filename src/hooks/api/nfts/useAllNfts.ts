import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useAuthenticatedUser } from '../users/useUser';

type QueryProps = {
  userId: string;
};

const getAllNftsAction = 'fetch all nfts';

function getAllNftsCacheKey({ userId }: QueryProps) {
  return [`/nfts/user_get?user_id=${userId}`, getAllNftsAction];
}

// use this hook to force SWR to refetch all nfts for user
export function useMutateAllNftsCache() {
  const { id: userId } = useAuthenticatedUser();
  const { mutate } = useSWRConfig();

  return useCallback(async () => {
    await mutate(getAllNftsCacheKey({ userId }));
  }, [mutate, userId]);
}

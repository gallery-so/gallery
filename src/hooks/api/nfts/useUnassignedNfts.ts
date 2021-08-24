import { Nft } from 'types/Nft';
import { User } from 'types/User';
import { useAuthenticatedUser } from '../users/useUser';
import useGet from '../_rest/useGet';

type UnassignedNftsResponse = {
  nfts: Nft[];
};

const getUnassignedNftsAction = 'fetch unassigned nfts';

const getUnassignedNftsBaseUrl = '/nfts/get_unassigned';

type QueryProps = {
  userId: string;
  skipCache: boolean;
};

function getUnassignedNftsBaseUrlWithQuery({ userId, skipCache }: QueryProps) {
  return `${getUnassignedNftsBaseUrl}?user_id=${userId}&skip_cache=${skipCache}`;
}

export function getUnassignedNftsCacheKey({ userId, skipCache }: QueryProps) {
  return [
    getUnassignedNftsBaseUrlWithQuery({ userId, skipCache }),
    getUnassignedNftsAction,
  ];
}

export const unassignedNftsAction = 'fetch unassigned nfts';

type Props = {
  skipCache: boolean;
};

export default function useUnassignedNfts({
  skipCache,
}: Props): Nft[] | undefined {
  const user = useAuthenticatedUser() as User;
  if (!user) {
    throw new Error('Authenticated user not found');
  }

  const data = useGet<UnassignedNftsResponse>(
    getUnassignedNftsBaseUrlWithQuery({ userId: user.id, skipCache }),
    unassignedNftsAction
  );

  return data?.nfts;
}

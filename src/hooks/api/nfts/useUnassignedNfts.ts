import { Nft } from 'types/Nft';
import { User } from 'types/User';
import { useAuthenticatedUser } from '../users/useUser';
import useGet from '../_rest/useGet';

type UnassignedNftsResponse = {
  nfts: Nft[];
};

type GetUrlProps = {
  userId: string;
  skipCache: boolean;
};

export function getUnassignedNftsUrl({ userId, skipCache }: GetUrlProps) {
  return `/nfts/get_unassigned?user_id=${userId}&skip_cache=${skipCache}`;
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
    getUnassignedNftsUrl({ userId: user.id, skipCache }),
    unassignedNftsAction
  );

  return data?.nfts;
}

import { MembershipTier } from 'types/MembershipTier';
import useGet from '../_rest/useGet';

type GetMemberListResponse = {
  tiers: MembershipTier[];
};

export default function useMemberList(): MembershipTier[] {
  const data = useGet<GetMemberListResponse>('/users/membership', 'fetch member list');

  if (!data) {
    throw new Error('Error fetching member list');
  }

  return data.tiers;
}

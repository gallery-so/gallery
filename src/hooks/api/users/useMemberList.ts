import { MembershipOwner, MembershipTier } from 'types/MembershipTier';
import useGet from '../_rest/useGet';

type GetMemberListResponse = {
  tiers: MembershipTier[];
};

function dedupeOwners(owners: MembershipTier['owners']) {
  const dedupedOwners: Record<string, MembershipOwner> = {};
  owners.forEach(owner => {
    dedupedOwners[owner.username] = owner;
  })
  return Object.values(dedupedOwners);
}

export default function useMemberList(): MembershipTier[] {
  const data = useGet<GetMemberListResponse>('/users/membership', 'fetch member list');

  if (!data) {
    throw new Error('Error fetching member list');
  }

  // dedupe owners in case the backend includes the same owner more than once within a tier
  data.tiers.forEach((tier) => {
    if (tier !== null) {
      tier.owners = dedupeOwners(tier.owners);
    }
  })

  return data.tiers;
}

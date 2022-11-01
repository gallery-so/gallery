import TokenHolderList from 'components/TokenHolderList/TokenHolderList';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { MemberListTierFragment$key } from '__generated__/MemberListTierFragment.graphql';
import { useMemo } from 'react';

type Props = {
  tierRef: MemberListTierFragment$key;
};

function MemberListTier({ tierRef }: Props) {
  const tier = useFragment(
    graphql`
      fragment MemberListTierFragment on MembershipTier {
        name
        owners {
          ...TokenHolderListFragment
        }
      }
    `,
    tierRef
  );

  const nonNullTokenHolders = useMemo(() => {
    const holders = [];

    for (const owner of tier.owners ?? []) {
      if (owner) {
        holders.push(owner);
      }
    }

    return holders;
  }, [tier.owners]);

  return <TokenHolderList title={tier.name || ''} tokenHoldersRef={nonNullTokenHolders} />;
}

export default MemberListTier;

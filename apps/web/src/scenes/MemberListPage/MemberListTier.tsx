import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import TokenHolderList from '~/components/TokenHolderList/TokenHolderList';
import { MemberListTierFragment$key } from '~/generated/MemberListTierFragment.graphql';

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

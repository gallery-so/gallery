import TokenHolderList from './TokenHolderList';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { MemberListTierFragment$key } from '__generated__/MemberListTierFragment.graphql';

type Props = {
  tierRef: MemberListTierFragment$key;
};

function MemberListTier({ tierRef }: Props) {
  const tier = useFragment(
    graphql`
      fragment MemberListTierFragment on MembershipTier {
        name
        owners {
          dbid
          user @required(action: THROW) {
            username @required(action: THROW)
          }
          ...TokenHolderListItemFragment
        }
      }
    `,
    tierRef
  );

  return <TokenHolderList title={tier.name || ''} tokenHoldersRef={tier.owners} />;
}

export default MemberListTier;

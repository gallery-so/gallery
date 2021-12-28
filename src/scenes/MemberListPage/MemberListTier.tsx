import { useMemo } from 'react';
import styled from 'styled-components';
import { MembershipTier } from 'types/MembershipTier';
import { BodyMedium } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import MemberListOwner from './MemberListOwner';

function MemberListTier({ tier }: { tier: MembershipTier }) {
  const sortedOwners = useMemo(
    () => tier.owners.sort((a, b) => a.username.localeCompare(b.username)),
    [tier.owners]
  );

  return (
    <div>
      <StyledTierHeading>{tier.name} members</StyledTierHeading>
      <Spacer height={24} />
      <StyledOwnersWrapper>
        {sortedOwners.map((owner) => (
          <MemberListOwner key={owner.user_id} owner={owner} />
        ))}
      </StyledOwnersWrapper>
      <Spacer height={56} />
    </div>
  );
}

const StyledOwnersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const StyledTierHeading = styled(BodyMedium)`
  color: ${colors.gray50};
`;

export default MemberListTier;

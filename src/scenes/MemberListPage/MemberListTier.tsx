import { useMemo } from 'react';
import styled from 'styled-components';
import { MembershipTier } from 'types/MembershipTier';
import { BodyMedium } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import MemberListOwner from './MemberListOwner';
import { Directions } from 'src/components/core/enums';

// Get which side of the owner name to show the preview on
// 1st and 2nd column should be right, 3rd and 4th column should be left
function getPreviewDirection(index: number) {
  return index % 4 < 2 ? Directions.RIGHT : Directions.LEFT;
}

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
        {sortedOwners.map((owner, index) => (
          <MemberListOwner
            key={owner.user_id}
            owner={owner}
            direction={getPreviewDirection(index)}
          />
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

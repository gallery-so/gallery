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

type Props = {
  tier: MembershipTier;
  searchQuery: string;
  setFadeUsernames: (fadeUsernames: boolean) => void;
  fadeUsernames: boolean;
}

function MemberListTier({ tier, searchQuery, setFadeUsernames, fadeUsernames }: Props) {
  const sortedOwners = useMemo(() => {
    if (!tier.owners) {
      return [];
    }

    return tier.owners
      .filter((owner) => Boolean(owner.username))
      .sort((a, b) => a.username.localeCompare(b.username));
  }, [tier.owners]);

  const filteredOwners = useMemo(() => {
    if (!searchQuery) {
      return sortedOwners;
    }

    if (searchQuery === '#') {
      return sortedOwners.filter((owner) => !/^[A-Za-z]/.test(owner.username));
    }

    return sortedOwners.filter((owner) =>
      owner.username.toLowerCase().startsWith(searchQuery.toLocaleLowerCase())
    );
  }, [searchQuery, sortedOwners]);

  return (
    <div>
      <StyledTierHeading>{tier.name} members</StyledTierHeading>
      <Spacer height={24} />
      <StyledOwnersWrapper fadeUsernames={fadeUsernames}>
        {filteredOwners.map((owner, index) => (
          <MemberListOwner
            key={owner.user_id}
            owner={owner}
            direction={getPreviewDirection(index)}
            setFadeUsernames={setFadeUsernames}
          />
        ))}
      </StyledOwnersWrapper>
      <Spacer height={56} />
    </div>
  );
}

const StyledOwnersWrapper = styled.div<{ fadeUsernames: boolean }>`
  display: flex;
  flex-wrap: wrap;

  color: ${({ fadeUsernames }) => (fadeUsernames ? colors.gray30 : colors.black)};

  transition: color 0.2s ease-in-out;
`;

const StyledTierHeading = styled(BodyMedium)`
  color: ${colors.gray50};
`;

export default MemberListTier;

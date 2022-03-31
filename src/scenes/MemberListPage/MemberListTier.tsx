import { useMemo } from 'react';
import styled from 'styled-components';
import { TitleS } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import MemberListOwner from './MemberListOwner';
import { Directions } from 'src/components/core/enums';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { MemberListTierFragment$key } from '../../../__generated__/MemberListTierFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { useMemberListPageState } from 'contexts/memberListPage/MemberListPageContext';

// Get which side of the owner name to show the preview on
// 1st and 2nd column should be right, 3rd and 4th column should be left
function getPreviewDirection(index: number) {
  return index % 4 < 2 ? Directions.RIGHT : Directions.LEFT;
}

type Props = {
  tierRef: MemberListTierFragment$key;
};

function MemberListTier({ tierRef }: Props) {
  const tier = useFragment(
    graphql`
      fragment MemberListTierFragment on MembershipTier {
        name
        owners {
          id
          user @required(action: NONE) {
            username @required(action: NONE)
          }

          ...MemberListOwnerFragment
        }
      }
    `,
    tierRef
  );

  const { fadeUsernames, searchQuery } = useMemberListPageState();

  const sortedOwners = useMemo(() => {
    const nonNullOwners = removeNullValues(tier.owners ?? []);

    nonNullOwners.sort((a, b) =>
      a.user.username.toLowerCase().localeCompare(b.user.username.toLowerCase())
    );

    return nonNullOwners;
  }, [tier.owners]);

  const filteredOwners = useMemo(() => {
    if (!searchQuery) {
      return sortedOwners;
    }

    if (searchQuery === '#') {
      return sortedOwners.filter((owner) => !/^[A-Za-z]/.test(owner.user.username));
    }

    return sortedOwners.filter((owner) =>
      owner.user.username.toLowerCase().startsWith(searchQuery.toLocaleLowerCase())
    );
  }, [searchQuery, sortedOwners]);

  return (
    <div>
      <StyledTierHeading>{tier.name}</StyledTierHeading>
      <Spacer height={24} />
      <StyledOwnersWrapper fadeUsernames={fadeUsernames}>
        {filteredOwners.map((owner, index) => (
          <MemberListOwner key={owner.id} ownerRef={owner} direction={getPreviewDirection(index)} />
        ))}
      </StyledOwnersWrapper>
      <Spacer height={56} />
    </div>
  );
}

const StyledOwnersWrapper = styled.div<{ fadeUsernames: boolean }>`
  display: flex;
  flex-wrap: wrap;

  color: ${({ fadeUsernames }) => (fadeUsernames ? colors.porcelain : colors.offBlack)};

  transition: color 0.15s ease-in-out;
`;

const StyledTierHeading = styled(TitleS)`
  color: ${colors.metal};
`;

export default MemberListTier;

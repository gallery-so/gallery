import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { CommunityProfilePictureStackFragment$key } from '~/generated/CommunityProfilePictureStackFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleXS } from '../core/Text/Text';
import CommunityProfilePicture from './CommunityProfilePicture';

type Props = {
  communitiesRef: CommunityProfilePictureStackFragment$key;
  total: number;
  onClick?(): void;
};

const TOTAL_COMMUNITIES_SHOWN = 3;

export function CommunityProfilePictureStack({ communitiesRef, total, onClick }: Props) {
  const communities = useFragment(
    graphql`
      fragment CommunityProfilePictureStackFragment on Community @relay(plural: true) {
        __typename
        dbid
        profileImageURL
        ...CommunityProfilePictureFragment
      }
    `,
    communitiesRef
  );

  const [isHovered, setIsHovered] = useState(false);

  const track = useTrack();

  const handleClick = useCallback(() => {
    track('CommunityProfilePictureStack Click');

    if (onClick) {
      onClick();
    }
  }, [track, onClick]);

  // Sort by community that has a profile image
  // Priority is given to the community that has a profile image
  const sortedCommunities = removeNullValues(communities).sort((a, b) => {
    if (a.profileImageURL && !b.profileImageURL) {
      return -1;
    }

    if (!a.profileImageURL && b.profileImageURL) {
      return 1;
    }

    return 0;
  });

  // We only show 3 communities
  const communitiesToShow = sortedCommunities.slice(0, TOTAL_COMMUNITIES_SHOWN);

  // If there are more than 3 communities, we show the remaining count
  const remainingCount = total - TOTAL_COMMUNITIES_SHOWN;

  return (
    <StyledCommunityProfilePictureStackContainer
      align="center"
      inline
      onClick={handleClick}
      isClickable={!!onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {communitiesToShow.map((community) => (
        <StyledCommunityProfilePictureContainer key={community.dbid}>
          <CommunityProfilePicture
            communityRef={community}
            size="sm"
            hasInset
            isHover={isHovered}
          />
        </StyledCommunityProfilePictureContainer>
      ))}
      {remainingCount > 0 && (
        <StyledRemainings align="center" justify="center" shrink>
          <StyledRemainingsText color={colors.metal}>+{remainingCount}</StyledRemainingsText>
        </StyledRemainings>
      )}
    </StyledCommunityProfilePictureStackContainer>
  );
}

const StyledCommunityProfilePictureContainer = styled.div`
  margin-left: -8px;
  position: relative;
  z-index: 1;
  pointer-events: none;
`;
const StyledRemainings = styled(VStack)`
  background-color: ${colors.porcelain};
  padding: 2px 8px;
  height: fit-content;

  border: 2px solid ${colors.white};
  border-radius: 24px;

  margin-left: -8px;
  z-index: 1;
`;

const StyledRemainingsText = styled(TitleXS)`
  font-weight: 500;
  white-space: nowrap;
`;

const StyledCommunityProfilePictureStackContainer = styled(HStack)<{ isClickable: boolean }>`
  position: relative;
  ${StyledCommunityProfilePictureContainer}:nth-child(1) {
    margin-left: 0;
  }

  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};

  &:hover {
    ${StyledRemainings} {
      background-color: ${colors.metal};
      ${StyledRemainingsText} {
        color: ${colors.black[800]};
      }
    }
  }
`;

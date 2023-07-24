import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ProfilePictureStackFragment$key } from '~/generated/ProfilePictureStackFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleXS } from '../core/Text/Text';
import { ProfilePicture } from './ProfilePicture';

type Props = {
  usersRef: ProfilePictureStackFragment$key;
  total: number;
  onClick?(): void;
};

const TOTAL_USERS_SHOWN = 3;

export function ProfilePictureStack({ usersRef, total, onClick }: Props) {
  const users = useFragment(
    graphql`
      fragment ProfilePictureStackFragment on GalleryUser @relay(plural: true) {
        __typename
        dbid
        profileImage {
          __typename
        }
        ...ProfilePictureFragment
      }
    `,
    usersRef,
  );

  const [isHovered, setIsHovered] = useState(false);

  const track = useTrack();

  const handleClick = useCallback(() => {
    track('ProfilePictureStack Click');

    if (onClick) {
      onClick();
    }
  }, [track, onClick]);

  // Sort by user that has a profile image
  // Priority is given to the user that has a profile image
  const sortedUsers = removeNullValues(users).sort((a, b) => {
    if (a.profileImage && !b.profileImage) {
      return -1;
    }

    if (!a.profileImage && b.profileImage) {
      return 1;
    }

    return 0;
  });

  // We only show 3 users
  const usersToShow = sortedUsers.slice(0, TOTAL_USERS_SHOWN);

  // If there are more than 3 users, we show the remaining count
  const remainingCount = total - TOTAL_USERS_SHOWN;

  return (
    <StyledProfilePictureStackContainer
      align="center"
      inline
      onClick={handleClick}
      isClickable={!!onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {usersToShow.map((user) => (
        <StyledProfilePictureContainer key={user.dbid}>
          <ProfilePicture userRef={user} size="sm" hasInset isHover={isHovered} />
        </StyledProfilePictureContainer>
      ))}
      {remainingCount > 0 && (
        <StyledRemainings align="center" justify="center" shrink>
          <StyledRemainingsText color={colors.metal}>+{remainingCount}</StyledRemainingsText>
        </StyledRemainings>
      )}
    </StyledProfilePictureStackContainer>
  );
}

const StyledProfilePictureContainer = styled.div`
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

const StyledProfilePictureStackContainer = styled(HStack)<{ isClickable: boolean }>`
  position: relative;
  ${StyledProfilePictureContainer}:nth-child(1) {
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

import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ProfilePictureStackFragment$key } from '~/generated/ProfilePictureStackFragment.graphql';
import colors from '~/shared/theme/colors';

import { HStack, VStack } from './core/Spacer/Stack';
import { TitleXS } from './core/Text/Text';
import { RawProfilePicture } from './RawProfilePicture';
import { ProfilePicture } from './ProfilePicture/ProfilePicture';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type Props = {
  usersRef: ProfilePictureStackFragment$key;
};

const TOTAL_USERS_SHOWN = 3;

export function ProfilePictureStack({ usersRef }: Props) {
  const users = useFragment(
    graphql`
      fragment ProfilePictureStackFragment on GalleryUser @relay(plural: true) {
        __typename
        username
        profileImage {
          __typename
        }
        ...ProfilePictureFragment
      }
    `,
    usersRef
  );

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
  const remainingCount = sortedUsers.length - TOTAL_USERS_SHOWN;

  return (
    <StyledProfilePictureStackContainer align="center">
      {usersToShow.map((user) => (
        <StyledRawProfilePictureContainer>
          <ProfilePicture userRef={user} />
        </StyledRawProfilePictureContainer>
      ))}
      {remainingCount > 0 && (
        <StyledRemainings align="center" justify="center" shrink>
          <StyledRemainingsText color={colors.metal}>+ {remainingCount}</StyledRemainingsText>
        </StyledRemainings>
      )}
    </StyledProfilePictureStackContainer>
  );
}

const StyledRawProfilePictureContainer = styled.div`
  margin-left: -8px;
  position: relative;
  z-index: 1;
`;

const StyledProfilePictureStackContainer = styled(HStack)`
  ${StyledRawProfilePictureContainer}:nth-child(1) {
    margin-left: 0;
  }
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
`;

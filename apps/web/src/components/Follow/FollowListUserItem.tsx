import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import { FollowListUserItemFragment$key } from '~/generated/FollowListUserItemFragment.graphql';
import { FollowListUserItemQueryFragment$key } from '~/generated/FollowListUserItemQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

import HoverCardOnUsername from '../HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

type Props = {
  queryRef: FollowListUserItemQueryFragment$key;
  userRef: FollowListUserItemFragment$key;
  username: string;
  bio?: string;
  handleClick: () => void;
};

export default function FollowListUserItem({
  queryRef,
  userRef,
  username,
  bio,
  handleClick,
}: Props) {
  const query = useFragment(
    graphql`
      fragment FollowListUserItemQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment FollowListUserItemFragment on GalleryUser {
        ...FollowButtonUserFragment
        ...HoverCardOnUsernameFragment
        ...ProfilePictureFragment
      }
    `,
    userRef
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StyledListItem href={`/${username}`} onClick={handleClick} isMobile={isMobile}>
      <HStack gap={8} align="center">
        <ProfilePicture userRef={user} size="md" />
        <VStack inline>
          <HoverCardOnUsername userRef={user}></HoverCardOnUsername>
          <StyledBaseM>
            {bio && (
              <VStack justify="center">
                <Markdown text={bio} />
              </VStack>
            )}
          </StyledBaseM>
        </VStack>
      </HStack>
      {query && user && (
        <VStack justify="center">
          <StyledFollowButton queryRef={query} userRef={user} />
        </VStack>
      )}
    </StyledListItem>
  );
}

const StyledListItem = styled.a<{ isMobile: boolean }>`
  display: flex;
  padding-top: 16px;
  padding-bottom: 16px;
  text-decoration: none;
  justify-content: space-between;
  gap: 4px;

  &:hover {
    background: ${colors.offWhite};
  }

  @media only screen and ${breakpoints.desktop} {
    gap: 72px;
  }
`;

const StyledBaseM = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  p {
    padding-bottom: 0;
  }
`;

const StyledFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 92px;
  height: 24px;
`;

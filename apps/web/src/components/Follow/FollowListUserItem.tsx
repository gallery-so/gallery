import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import { FollowListUserItemFragment$key } from '~/generated/FollowListUserItemFragment.graphql';
import { FollowListUserItemQueryFragment$key } from '~/generated/FollowListUserItemQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';
import { BREAK_LINES } from '~/utils/regex';

import HoverCardOnUsername from '../HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

type Props = {
  queryRef: FollowListUserItemQueryFragment$key;
  userRef: FollowListUserItemFragment$key;
  fadeUsernames: boolean;
  setFadeUsernames: (val: boolean) => void;
  handleClick: () => void;
};

export default function FollowListUserItem({
  queryRef,
  userRef,
  fadeUsernames,
  handleClick,
  setFadeUsernames,
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
        bio
        username
        ...FollowButtonUserFragment
        ...HoverCardOnUsernameFragment
        ...ProfilePictureFragment
      }
    `,
    userRef
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const formattedUserBio = useMemo(() => {
    const truncate = (bio: string) => {
      const maxLength = isMobile ? 250 : 320;
      if (bio.length > maxLength) {
        return `${bio.slice(0, maxLength)}...`;
      }
      return bio;
    };
    return truncate((user.bio ?? '').replace(BREAK_LINES, ''));
  }, [isMobile, user.bio]);

  const onMouseEnter = useCallback(() => {
    setFadeUsernames(true);
  }, [setFadeUsernames]);

  const onMouseLeave = useCallback(() => {
    setFadeUsernames(false);
  }, [setFadeUsernames]);
  return (
    <StyledListItem
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      href={`/${user.username}`}
      onClick={handleClick}
      fadeUsernames={fadeUsernames}
    >
      <HStack gap={8} align="center">
        <ProfilePicture userRef={user} size="md" />
        <HoverCardOnUsername userRef={user}>
          <VStack inline>
            <TitleS>{user.username}</TitleS>
            <StyledBaseM>
              {formattedUserBio && (
                <StyledContainer justify="center">
                  <Markdown text={formattedUserBio} />
                </StyledContainer>
              )}
            </StyledBaseM>
          </VStack>
        </HoverCardOnUsername>
      </HStack>
      <VStack justify="center">
        <StyledFollowButton queryRef={query} userRef={user} />
      </VStack>
    </StyledListItem>
  );
}

const StyledListItem = styled.a<{ fadeUsernames: boolean }>`
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  padding-bottom: 16px;
  gap: 4px;
  min-height: 72px;

  transition: color 0.15s ease-in-out, opacity 0.15s ease-in-out;
  opacity: ${({ fadeUsernames }) => (fadeUsernames ? 0.5 : 1)};

  &:hover {
    color: ${colors.black['800']};
    opacity: 1;
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

const StyledContainer = styled(VStack)`
  max-width: 250px;

  @media only screen and ${breakpoints.desktop} {
    max-width: none;
  }
`;

const StyledFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 92px;
  height: 24px;
`;

import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import { FollowListUserItemFragment$key } from '~/generated/FollowListUserItemFragment.graphql';
import { FollowListUserItemQueryFragment$key } from '~/generated/FollowListUserItemQueryFragment.graphql';
import colors from '~/shared/theme/colors';

import HoverCardOnUsername from '../HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

type Props = {
  queryRef: FollowListUserItemQueryFragment$key;
  userRef: FollowListUserItemFragment$key;
  username: string;
  bio?: string;
  fadeUsernames: boolean;
  setFadeUsernames: (val: boolean) => void;
  handleClick: () => void;
};

export default function FollowListUserItem({
  queryRef,
  userRef,
  username,
  bio,
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
        ...FollowButtonUserFragment
        ...HoverCardOnUsernameFragment
        ...ProfilePictureFragment
      }
    `,
    userRef
  );

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
      href={`/${username}`}
      onClick={handleClick}
      fadeUsernames={fadeUsernames}
    >
      <HStack gap={8} align="center">
        <ProfilePicture userRef={user} size="md" />
        <HoverCardOnUsername userRef={user}>
          <VStack inline>
            <TitleS>{username}</TitleS>
            <StyledBaseM>
              {bio && (
                <VStack justify="center">
                  <Markdown text={bio} />
                </VStack>
              )}
            </StyledBaseM>
          </VStack>
        </HoverCardOnUsername>
      </HStack>
      {query && user && (
        <VStack justify="center">
          <StyledFollowButton queryRef={query} userRef={user} />
        </VStack>
      )}
    </StyledListItem>
  );
}

const StyledListItem = styled.a<{ fadeUsernames: boolean }>`
  display: flex;
  padding-top: 16px;
  padding-bottom: 16px;
  text-decoration: none;
  justify-content: space-between;
  transition: color 0.15s ease-in-out, opacity 0.15s ease-in-out;
  opacity: ${({ fadeUsernames }) => (fadeUsernames ? 0.5 : 1)};
  gap: 4px;

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

const StyledFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 92px;
  height: 24px;
`;

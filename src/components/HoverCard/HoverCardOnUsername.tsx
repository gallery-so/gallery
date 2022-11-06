import unescape from 'lodash/unescape';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import Badge from '~/components/Badge/Badge';
import colors from '~/components/core/colors';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleM } from '~/components/core/Text/Text';
import transitions, {
  ANIMATED_COMPONENT_TRANSITION_MS,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
} from '~/components/core/transitions';
import FollowButton from '~/components/Follow/FollowButton';
import { HoverCardOnUsernameFollowFragment$key } from '~/generated/HoverCardOnUsernameFollowFragment.graphql';
import { HoverCardOnUsernameFragment$key } from '~/generated/HoverCardOnUsernameFragment.graphql';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';

type Props = {
  userRef: HoverCardOnUsernameFragment$key;
  queryRef: HoverCardOnUsernameFollowFragment$key;
};

export default function HoverCardOnUsername({ userRef, queryRef }: Props) {
  const router = useRouter();

  const user = useFragment(
    graphql`
      fragment HoverCardOnUsernameFragment on GalleryUser {
        id
        username
        bio
        galleries @required(action: THROW) {
          collections {
            dbid
            name
            hidden
          }
        }
        badges {
          name
          imageURL
          ...BadgeFragment
        }
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment HoverCardOnUsernameFollowFragment on Query {
        ...FollowButtonQueryFragment
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const filteredCollections = user?.galleries[0]?.collections?.filter(
    (collection) => !collection?.hidden
  );

  const totalCollections = filteredCollections?.length || 0;

  // Pseudo-state for signaling animations. This gives us a chance
  // to display an animation prior to unmounting the component
  const [isActive, setIsActive] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const deactivateHoverCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleMouseEnter = () => {
    if (deactivateHoverCardTimeoutRef.current) {
      clearTimeout(deactivateHoverCardTimeoutRef.current);
    }

    setIsActive(true);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    deactivateHoverCardTimeoutRef.current = setTimeout(
      () => setIsActive(false),
      ANIMATED_COMPONENT_TRANSITION_MS
    );
  };

  const handleClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();
      router.push({ pathname: '/[username]', query: { username: user.username as string } });
    },
    [user, router]
  );

  const loggedInUserId = useLoggedInUserId(query);
  const isOwnProfile = loggedInUserId === user?.id;
  const isLoggedIn = !!loggedInUserId;

  const handleUsernameClick = useCallback<MouseEventHandler>((event) => {
    event.stopPropagation();
  }, []);

  const userBadges = useMemo(() => {
    const badges = [];

    for (const badge of user?.badges ?? []) {
      if (badge?.imageURL) {
        badges.push(badge);
      }
    }

    return badges;
  }, [user?.badges]);

  return (
    <StyledContainer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <StyledLinkContainer>
        <Link href={{ pathname: '/[username]', query: { username: user.username as string } }}>
          <TitleDiatypeM onClick={handleUsernameClick}>{user.username}</TitleDiatypeM>
        </Link>
      </StyledLinkContainer>
      <StyledCardWrapper isHovering={isHovering} onClick={handleClick}>
        {isActive && (
          <StyledCardContainer>
            <StyledCardHeader>
              <HStack align="center" gap={4}>
                <HStack align="center" gap={6}>
                  <StyledCardUsername>{user.username}</StyledCardUsername>

                  {userBadges.map((badge) => (
                    // Might need to rethink this layout when we have more badges
                    <Badge key={badge.name} badgeRef={badge} />
                  ))}
                </HStack>

                {isLoggedIn && !isOwnProfile && (
                  <StyledFollowButtonWrapper>
                    <FollowButton userRef={user} queryRef={query} />
                  </StyledFollowButtonWrapper>
                )}
              </HStack>

              <BaseM>{totalCollections} collections</BaseM>
            </StyledCardHeader>

            {user.bio && (
              <StyledCardDescription>
                <BaseM>
                  <Markdown text={unescape(user.bio)}></Markdown>
                </BaseM>
              </StyledCardDescription>
            )}
          </StyledCardContainer>
        )}
      </StyledCardWrapper>
    </StyledContainer>
  );
}

const StyledContainer = styled.span`
  position: relative;
  display: inline-block;
`;

const StyledLinkContainer = styled.div`
  display: inline-block;
`;

const StyledCardWrapper = styled.div<{ isHovering: boolean }>`
  padding-top: 8px;
  position: absolute;
  z-index: 1;
  top: 100%;

  transition: ${transitions.cubic};
  transform: ${({ isHovering }) =>
    `translateY(${isHovering ? 0 : ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL}px)`};
  opacity: ${({ isHovering }) => (isHovering ? 1 : 0)};
`;

const StyledCardContainer = styled.div`
  border: 1px solid ${colors.offBlack};
  padding: 16px;
  width: 375px;
  display: grid;
  gap: 8px;
  background-color: ${colors.white};
`;

const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  // enforce height on container since the follow button causes additional height
  height: 24px;
`;

const StyledFollowButtonWrapper = styled.div`
  margin-right: 8px;
`;

const StyledCardUsername = styled(TitleM)`
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 200px;
`;

const StyledCardDescription = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

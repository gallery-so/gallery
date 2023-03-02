import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  inline,
  shift,
  useFloating,
  useHover,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import unescape from 'lodash/unescape';
import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import Badge from '~/components/Badge/Badge';
import colors from '~/components/core/colors';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleM } from '~/components/core/Text/Text';
import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '~/components/core/transitions';
import FollowButton from '~/components/Follow/FollowButton';
import { HoverCardOnUsernameFollowFragment$key } from '~/generated/HoverCardOnUsernameFollowFragment.graphql';
import { HoverCardOnUsernameFragment$key } from '~/generated/HoverCardOnUsernameFragment.graphql';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';
import { pluralize } from '~/utils/string';

const HOVER_POPUP_DELAY = 100;

type Props = {
  userRef: HoverCardOnUsernameFragment$key;
  queryRef: HoverCardOnUsernameFollowFragment$key;
  children?: React.ReactNode;
};

export default function HoverCardOnUsername({ children, userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment HoverCardOnUsernameFragment on GalleryUser {
        id
        username
        bio
        galleries @required(action: THROW) {
          collections {
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

  const [isHovering, setIsHovering] = useState(false);

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement: 'bottom-start',
    open: isHovering,
    onOpenChange: setIsHovering,
    middleware: [flip(), shift(), inline()],
    whileElementsMounted: autoUpdate,
  });

  const role = useRole(context);
  const hover = useHover(context, { delay: HOVER_POPUP_DELAY });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role]);

  const headingId = useId();

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

  const userProfileLink = useMemo((): Route => {
    return { pathname: '/[username]', query: { username: user.username as string } };
  }, [user]);

  if (!user.username) {
    return null;
  }

  const displayName = handleCustomDisplayName(user.username);

  return (
    <StyledContainer>
      <StyledLinkContainer ref={reference} {...getReferenceProps()}>
        <Link href={userProfileLink} legacyBehavior>
          {children ? (
            children
          ) : (
            <TitleDiatypeM onClick={handleUsernameClick}>{displayName}</TitleDiatypeM>
          )}
        </Link>
      </StyledLinkContainer>

      <AnimatePresence>
        {isHovering && (
          <FloatingFocusManager context={context} modal={false}>
            <Link href={userProfileLink}>
              <StyledCardWrapper
                className="Popover"
                aria-labelledby={headingId}
                // Floating UI Props
                ref={floating}
                style={{
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                }}
                {...getFloatingProps()}
                // Framer Motion Props
                transition={{
                  duration: ANIMATED_COMPONENT_TRANSITION_S,
                  ease: rawTransitions.cubicValues,
                }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL }}
                exit={{ opacity: 0, y: 0 }}
              >
                <StyledCardContainer>
                  <StyledCardHeader>
                    <HStack align="center" gap={4}>
                      <HStack align="center" gap={4}>
                        <StyledCardUsername>{displayName}</StyledCardUsername>

                        <HStack align="center" gap={0}>
                          {userBadges.map((badge) => (
                            // Might need to rethink this layout when we have more badges
                            <Badge key={badge.name} badgeRef={badge} />
                          ))}
                        </HStack>
                      </HStack>

                      {isLoggedIn && !isOwnProfile && (
                        <StyledFollowButtonWrapper>
                          <FollowButton userRef={user} queryRef={query} />
                        </StyledFollowButtonWrapper>
                      )}
                    </HStack>

                    <BaseM>
                      {totalCollections} {pluralize(totalCollections, 'collection')}
                    </BaseM>
                  </StyledCardHeader>

                  {user.bio && (
                    <StyledCardDescription>
                      <BaseM>
                        <Markdown text={unescape(user.bio)}></Markdown>
                      </BaseM>
                    </StyledCardDescription>
                  )}
                </StyledCardContainer>
              </StyledCardWrapper>
            </Link>
          </FloatingFocusManager>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
}

const StyledContainer = styled.span`
  position: relative;
  display: inline-grid;
  cursor: pointer;
`;

const StyledLinkContainer = styled.div`
  display: inline-flex;
`;

const StyledCardWrapper = styled(motion.div)`
  z-index: 1;

  :focus {
    outline: none;
  }
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
  max-width: 150px;
`;

const StyledCardDescription = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  -webkit-box-pack: end;
  p {
    display: inline;
  }
`;

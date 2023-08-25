import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  inline,
  shift,
  useFloating,
  useHover,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { MouseEventHandler, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment, useQueryLoader } from 'react-relay';
import styled from 'styled-components';

import { BaseS, TitleDiatypeM } from '~/components/core/Text/Text';
import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '~/components/core/transitions';
import {
  HoverCard,
  HoverCardCommunityQueryNode,
  HoverCardOnCommunity,
  HoverCardQueryNode,
} from '~/components/HoverCard/HoverCard';
import { Chain } from '~/generated/enums';
import { HoverCardCommunityQuery } from '~/generated/HoverCardCommunityQuery.graphql';
import { HoverCardOnUsernameCommunityFragment$key } from '~/generated/HoverCardOnUsernameCommunityFragment.graphql';
import { HoverCardOnUsernameFragment$key } from '~/generated/HoverCardOnUsernameFragment.graphql';
import { HoverCardQuery } from '~/generated/HoverCardQuery.graphql';
import { COMMUNITIES_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedCommunities';
import { FOLLOWERS_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedInfoList/SharedFollowersList';
import colors from '~/shared/theme/colors';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';
import noop from '~/utils/noop';

import breakpoints, { pageGutter } from '../core/breakpoints';

const HOVER_POPUP_DELAY = 100;

type Props = {
  userRef: HoverCardOnUsernameFragment$key;
  children?: React.ReactNode;
  onClick?: () => void;
};

export default function HoverCardOnUsername({ children, userRef, onClick = noop }: Props) {
  const user = useFragment(
    graphql`
      fragment HoverCardOnUsernameFragment on GalleryUser {
        dbid
        username
      }
    `,
    userRef
  );

  const [preloadedHoverCardQuery, preloadHoverCardQuery] =
    useQueryLoader<HoverCardQuery>(HoverCardQueryNode);

  const [isHovering, setIsHovering] = useState(false);

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement: 'bottom-start',
    open: isHovering,
    onOpenChange: setIsHovering,
    middleware: [flip(), shift(), inline()],
    whileElementsMounted: autoUpdate,
  });

  const headingId = useId();
  const role = useRole(context);
  const hover = useHover(context, { delay: HOVER_POPUP_DELAY });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role]);

  const handleUsernameClick = useCallback<MouseEventHandler>(
    (event) => {
      event.stopPropagation();
      onClick();
    },
    [onClick]
  );

  const userProfileLink = useMemo((): Route => {
    return { pathname: '/[username]', query: { username: user.username as string } };
  }, [user]);

  useEffect(() => {
    if (isHovering) {
      preloadHoverCardQuery({
        userId: user.dbid,
        sharedCommunitiesFirst: COMMUNITIES_PER_PAGE,
        sharedFollowersFirst: FOLLOWERS_PER_PAGE,
      });
    }
  }, [preloadHoverCardQuery, user.dbid, isHovering]);

  if (!user.username) {
    return null;
  }

  const displayName = handleCustomDisplayName(user.username);

  return (
    <StyledContainer>
      <StyledLinkContainer ref={reference} {...getReferenceProps()}>
        <StyledLink href={userProfileLink} onClick={handleUsernameClick}>
          {children ? children : <TitleDiatypeM>{displayName}</TitleDiatypeM>}
        </StyledLink>
      </StyledLinkContainer>

      <AnimatePresence>
        {isHovering && preloadedHoverCardQuery && (
          <FloatingPortal preserveTabOrder={false}>
            <FloatingFocusManager context={context} modal={false}>
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
                  <Suspense fallback={null}>
                    <HoverCard preloadedQuery={preloadedHoverCardQuery} />
                  </Suspense>
                </StyledCardContainer>
              </StyledCardWrapper>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
}

type CommunityProps = {
  children?: React.ReactNode;
  onClick?: () => void;
  communityRef: HoverCardOnUsernameCommunityFragment$key;
};

export function HoverCardOnCommunityWrapper({
  children,
  onClick = noop,
  communityRef,
}: CommunityProps) {
  const community = useFragment(
    graphql`
      fragment HoverCardOnUsernameCommunityFragment on Community {
        name
        contractAddress {
          address
          chain
        }
      }
    `,
    communityRef
  );

  const handleCommunityClick = useCallback<MouseEventHandler>(
    (event) => {
      event.stopPropagation();
      onClick();
    },
    [onClick]
  );

  const communityProfileLink = useMemo((): Route => {
    return {
      pathname: '/community/[chain]/[contractAddress]',
      query: {
        contractAddress: community.contractAddress?.address as string,
        chain: community.contractAddress?.chain as string,
      },
    };
  }, [community]);

  const [preloadedHoverCardCommunityQuery, preloadHoverCardCommunityQuery] =
    useQueryLoader<HoverCardCommunityQuery>(HoverCardCommunityQueryNode);

  const [isHovering, setIsHovering] = useState(false);

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement: 'bottom-start',
    open: isHovering,
    onOpenChange: setIsHovering,
    middleware: [flip(), shift(), inline()],
    whileElementsMounted: autoUpdate,
  });

  const headingId = useId();
  const role = useRole(context);
  const hover = useHover(context, { delay: HOVER_POPUP_DELAY });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role]);

  useEffect(() => {
    preloadHoverCardCommunityQuery({
      communityAddress: {
        address: community.contractAddress?.address as string,
        chain: community.contractAddress?.chain as Chain,
      },
    });
  }, [
    isHovering,
    preloadHoverCardCommunityQuery,
    community.contractAddress?.address,
    community.contractAddress?.chain,
  ]);

  if (!community.name) {
    return null;
  }

  const displayName = handleCustomDisplayName(community.name);

  return (
    <StyledContainer>
      <StyledLinkContainer ref={reference} {...getReferenceProps()}>
        <StyledLink href={communityProfileLink} onClick={handleCommunityClick}>
          {children ? children : <BaseS color={colors.shadow}>{displayName}</BaseS>}
        </StyledLink>
      </StyledLinkContainer>

      <AnimatePresence>
        {isHovering && preloadedHoverCardCommunityQuery && (
          <FloatingPortal preserveTabOrder={false}>
            <FloatingFocusManager context={context} modal={false}>
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
                  <Suspense fallback={null}>
                    <HoverCardOnCommunity
                      preloadedCommunityQuery={preloadedHoverCardCommunityQuery}
                    />
                  </Suspense>
                </StyledCardContainer>
              </StyledCardWrapper>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
}

const StyledCardContainer = styled.div`
  border: 1px solid ${colors.black['800']};
  padding: 16px;
  width: 375px;
  max-width: calc(100vw - ${pageGutter.mobile * 2}px);
  display: grid;
  gap: 8px;
  background-color: ${colors.white};

  @media only screen and ${breakpoints.desktop} {
    max-width: initial;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const StyledCardWrapper = styled(motion.div)`
  z-index: 11;

  :focus {
    outline: none;
  }
`;

const StyledContainer = styled.span`
  position: relative;
  display: inline-grid;
  cursor: initial;
`;

const StyledLinkContainer = styled.div`
  display: inline-flex;
`;

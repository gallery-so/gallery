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
import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { MouseEventHandler, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment, useQueryLoader } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '~/components/core/transitions';
import { HoverCard, HoverCardQueryNode } from '~/components/HoverCard/HoverCard';
import { HoverCardOnUsernameFragment$key } from '~/generated/HoverCardOnUsernameFragment.graphql';
import { HoverCardQuery } from '~/generated/HoverCardQuery.graphql';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

const HOVER_POPUP_DELAY = 100;

type Props = {
  userRef: HoverCardOnUsernameFragment$key;
  children?: React.ReactNode;
};

export default function HoverCardOnUsername({ children, userRef }: Props) {
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

  const handleUsernameClick = useCallback<MouseEventHandler>((event) => {
    event.stopPropagation();
  }, []);

  const userProfileLink = useMemo((): Route => {
    return { pathname: '/[username]', query: { username: user.username as string } };
  }, [user]);

  useEffect(() => {
    if (isHovering) {
      preloadHoverCardQuery({ userId: user.dbid });
    }
  }, [preloadHoverCardQuery, user.dbid, isHovering]);

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
        {isHovering && preloadedHoverCardQuery && (
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
                  <Suspense fallback={null}>
                    <HoverCard preloadedQuery={preloadedHoverCardQuery} />
                  </Suspense>
                </StyledCardContainer>
              </StyledCardWrapper>
            </Link>
          </FloatingFocusManager>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
}

const StyledCardContainer = styled.div`
  border: 1px solid ${colors.offBlack};
  padding: 16px;
  width: 375px;
  display: grid;
  gap: 8px;
  background-color: ${colors.white};
`;

const StyledCardWrapper = styled(motion.div)`
  z-index: 1;

  :focus {
    outline: none;
  }
`;

const StyledContainer = styled.span`
  position: relative;
  display: inline-grid;
  cursor: pointer;
`;

const StyledLinkContainer = styled.div`
  display: inline-flex;
`;

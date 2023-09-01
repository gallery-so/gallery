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

import { BaseS } from '~/components/core/Text/Text';
import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '~/components/core/transitions';
import {
  HoverCardCommunityInner,
  HoverCardCommunityInnerQueryNode,
} from '~/components/HoverCard/HoverCardCommunityInner';
import { Chain } from '~/generated/enums';
import { HoverCardCommunityInnerQuery } from '~/generated/HoverCardCommunityInnerQuery.graphql';
import { HoverCardOnCommunityFragment$key } from '~/generated/HoverCardOnCommunityFragment.graphql';
import colors from '~/shared/theme/colors';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';
import noop from '~/utils/noop';

import breakpoints, { pageGutter } from '../core/breakpoints';

const HOVER_POPUP_DELAY = 100;

type Props = {
  children?: React.ReactNode;
  onClick?: () => void;
  communityRef: HoverCardOnCommunityFragment$key;
};

export default function HoverCardOnCommunity({ children, onClick = noop, communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment HoverCardOnCommunityFragment on Community {
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
    useQueryLoader<HoverCardCommunityInnerQuery>(HoverCardCommunityInnerQueryNode);

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
    if (isHovering) {
      preloadHoverCardCommunityQuery({
        communityAddress: {
          address: community.contractAddress?.address as string,
          chain: community.contractAddress?.chain as Chain,
        },
      });
    }
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
                    <HoverCardCommunityInner
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
  width: fit-content;
`;

const StyledLinkContainer = styled.div`
  display: inline-flex;
`;

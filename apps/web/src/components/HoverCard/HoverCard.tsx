import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  inline,
  shift,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Route } from 'nextjs-routes';
import { MouseEventHandler, Suspense, useCallback, useEffect, useId, useState } from 'react';
import { PreloadedQuery } from 'react-relay';
import { OperationType } from 'relay-runtime';
import styled from 'styled-components';

import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import noop from '~/utils/noop';

import breakpoints, { pageGutter } from '../core/breakpoints';
import GalleryLink from '../core/GalleryLink/GalleryLink';
import { SelfCenteredSpinner } from '../core/Spinner/Spinner';
import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '../core/transitions';

const HOVER_POPUP_DELAY_MS = 100;

export type HoverCardProps<T extends OperationType> = {
  HoverableElement?: React.ReactNode;
  onHoverableElementClick?: () => void;
  hoverableElementHref: Route;
  preloadQuery: () => void;
  preloadedQuery?: PreloadedQuery<T> | null;
  HoveringContent: React.ReactNode;
};

export default function HoverCard<T extends OperationType>({
  HoverableElement,
  onHoverableElementClick = noop,
  hoverableElementHref,
  HoveringContent,
  preloadedQuery,
  preloadQuery,
}: HoverCardProps<T>) {
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
  const hover = useHover(context, { delay: HOVER_POPUP_DELAY_MS });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role]);

  useEffect(() => {
    if (isHovering) {
      preloadQuery();
    }
  }, [isHovering, preloadQuery]);

  const handleClick = useCallback<MouseEventHandler>(
    (event) => {
      event.stopPropagation();
      onHoverableElementClick();
    },
    [onHoverableElementClick]
  );

  return (
    <StyledContainer>
      <StyledLinkContainer ref={reference} {...getReferenceProps()}>
        <GalleryLink
          to={hoverableElementHref}
          onClick={handleClick}
          eventElementId="Hover Card Hoverable Element"
          eventName="Hover Card Hoverable Element Click"
          eventContext={contexts['Hover Card']}
        >
          {HoverableElement}
        </GalleryLink>
      </StyledLinkContainer>

      <AnimatePresence>
        {isHovering && preloadedQuery && (
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
                  <Suspense fallback={<SelfCenteredSpinner />}>{HoveringContent}</Suspense>
                </StyledCardContainer>
              </StyledCardWrapper>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
}

const StyledContainer = styled.span`
  position: relative;
  display: inline-grid;
  cursor: initial;
  width: 100%;
`;

const StyledLinkContainer = styled.div`
  display: inline-flex;
`;

const StyledCardContainer = styled.div`
  border: 1px solid ${colors.black['800']};
  padding: 16px;
  width: 375px;
  min-height: 128px;
  max-width: calc(100vw - ${pageGutter.mobile * 2}px);
  display: flex;
  gap: 8px;
  background-color: ${colors.white};

  @media only screen and ${breakpoints.desktop} {
    max-width: initial;
  }
`;

const StyledCardWrapper = styled(motion.div)`
  z-index: 11;

  :focus {
    outline: none;
  }
`;

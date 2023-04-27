import { motion, MotionProps } from 'framer-motion';
import { MouseEvent, ReactElement, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '~/components/core/transitions';
import useDetectOutsideClick from '~/hooks/useDetectOutsideClick';
import useKeyDown from '~/hooks/useKeyDown';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

import { useDrawerActions } from './SidebarDrawerContext';

type Props = {
  content: ReactElement;
};

export default function AnimatedSidebarDrawer({ content }: Props) {
  const drawerRef = useRef(null);

  const { hideDrawer } = useDrawerActions();

  useDetectOutsideClick(drawerRef, hideDrawer);

  useKeyDown('Escape', hideDrawer);

  // Prevent useDetectOutsideClick from triggering if the user clicks inside the drawer.
  // This is needed for cases when the user clicks on elements that dissapear upon clicking, like the "See More" button in Notifications.
  const handleDrawerClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const isMobile = useIsMobileWindowWidth();

  const motionSettings = useMemo((): MotionProps => {
    // On mobile, the drawer slides up from the bottom. On desktop, it slides in from the left.
    return isMobile
      ? {
          initial: { opacity: 0, y: ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL },
        }
      : {
          initial: { opacity: 0, x: -ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL },
        };
  }, [isMobile]);

  return (
    <StyledMotion
      key="drawer"
      className="drawer"
      transition={{
        duration: ANIMATED_COMPONENT_TRANSITION_S,
        ease: rawTransitions.cubicValues,
      }}
      initial={motionSettings.initial}
      animate={motionSettings.animate}
      exit={motionSettings.exit}
    >
      <StyledDrawer ref={drawerRef} gap={16} onClick={handleDrawerClick}>
        {content}
      </StyledDrawer>
    </StyledMotion>
  );
}

const StyledMotion = styled(motion.div)`
  height: 100%;
  min-height: 0;
  display: flex;
  // flex: 1; and min-height: 0 on the child, StyledDrawer, prevents the drawer content from stretching this container beyond the viewable area
  flex: 1;
`;

const StyledDrawer = styled(VStack)`
  background-color: ${colors.offWhite};
  width: 100%;
  position: relative;
  min-height: 0;

  @media only screen and ${breakpoints.tablet} {
    height: 100vh;
    width: 420px;
  }
`;

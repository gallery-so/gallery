import { motion } from 'framer-motion';
import { MouseEvent, ReactElement, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '~/components/core/transitions';
import useDetectOutsideClick from '~/hooks/useDetectOutsideClick';
import useKeyDown from '~/hooks/useKeyDown';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import CloseIcon from '~/icons/CloseIcon';

import { useDrawerActions } from './SidebarDrawerContext';

type Props = {
  content: ReactElement;
  headerText?: string;
  showDoneFooter?: boolean;
};

export default function AnimatedSidebarDrawer({
  content,
  headerText,
  showDoneFooter = false,
}: Props) {
  const drawerRef = useRef(null);

  const { hideDrawer } = useDrawerActions();

  useDetectOutsideClick(drawerRef, hideDrawer);

  useKeyDown('Escape', hideDrawer);

  // Prevent useDetectOutsideClick from triggering if the user clicks inside the drawer.
  // This is needed for cases when the user clicks on elements that dissapear upon clicking, like the "See More" button in Notifications.
  const handleDrawerClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleCloseDrawerClick = useCallback(() => {
    hideDrawer();
  }, [hideDrawer]);

  const handleDoneClick = useCallback(() => {
    hideDrawer();
  }, [hideDrawer]);

  const isMobile = useIsMobileWindowWidth();

  const motionSettings = useMemo(() => {
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
        <StyledHeader>
          <CloseDrawerHeader align="center" justify="flex-end">
            <IconContainer
              variant="default"
              size="sm"
              onClick={handleCloseDrawerClick}
              icon={<CloseIcon />}
            />
          </CloseDrawerHeader>
          {headerText && <StyledHeadingText>{headerText}</StyledHeadingText>}
        </StyledHeader>
        <StyledContentWrapper showDoneFooter={showDoneFooter}>{content}</StyledContentWrapper>
        {showDoneFooter && (
          <StyledFooter align="center" justify="flex-end">
            <DoneButton onClick={handleDoneClick}>Done</DoneButton>
          </StyledFooter>
        )}
      </StyledDrawer>
    </StyledMotion>
  );
}

const CloseDrawerHeader = styled(HStack)`
  height: 52px;
`;

const StyledHeader = styled(VStack)`
  padding: 0 16px;
`;

// one-off text style that's not in our design system
const StyledHeadingText = styled(TitleDiatypeL)`
  font-size: 24px;
  line-height: 28px;
`;

const StyledMotion = styled(motion.div)`
  height: 100%;
  min-height: 0;
`;

const StyledDrawer = styled(VStack)`
  background-color: ${colors.offWhite};
  width: 100%;
  height: 100%;
  position: relative;

  @media only screen and ${breakpoints.tablet} {
    height: 100vh;
    width: 420px;
  }
`;

const StyledContentWrapper = styled.div<{ showDoneFooter: boolean }>`
  overflow-y: scroll;
  overflow-x: hidden;
  overscroll-behavior: contain;
  height: 100%;
`;

const DoneButton = styled(Button)`
  align-self: flex-end;
`;

const StyledFooter = styled(HStack)`
  width: 100%;
  background-color: ${colors.offWhite};
  position: absolute;
  display: flex;
  bottom: 0;
  padding: 12px 16px;
`;

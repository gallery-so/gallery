import { motion } from 'framer-motion';
import { ReactElement, useCallback, useRef } from 'react';
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

  const handleCloseDrawerClick = useCallback(() => {
    hideDrawer();
  }, [hideDrawer]);

  const handleDoneClick = useCallback(() => {
    hideDrawer();
  }, [hideDrawer]);

  return (
    <motion.div
      key="drawer"
      className="drawer"
      transition={{
        duration: ANIMATED_COMPONENT_TRANSITION_S,
        ease: rawTransitions.cubicValues,
      }}
      initial={{ opacity: 0, x: -ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL }}
    >
      <StyledDrawer ref={drawerRef} gap={16}>
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
        <StyledContentWrapper showDoneFooter={showDoneFooter}>
          <VStack gap={16}>{content}</VStack>
        </StyledContentWrapper>
        {showDoneFooter && (
          <StyledFooter align="center" justify="flex-end">
            <DoneButton onClick={handleDoneClick}>Done</DoneButton>
          </StyledFooter>
        )}
      </StyledDrawer>
    </motion.div>
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

const StyledDrawer = styled(VStack)`
  background-color: ${colors.offWhite};
  width: 100%;
  height: calc(100vh - 42px); // todo make 42 px a variable
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

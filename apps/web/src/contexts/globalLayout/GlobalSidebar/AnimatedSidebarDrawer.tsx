import { ReactElement, useCallback, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import useDetectOutsideClick from '~/hooks/useDetectOutsideClick';
import CloseIcon from '~/icons/CloseIcon';

import { GLOBAL_SIDEBAR_MOBILE_HEIGHT } from './GlobalSidebar';

type Props = {
  content: ReactElement;
  headerText?: string;
  hideDrawer: () => void;
};

export default function AnimatedSidebarDrawer({ content, hideDrawer, headerText }: Props) {
  const isActive = true;
  const drawerRef = useRef(null);

  useDetectOutsideClick(drawerRef, hideDrawer);

  const handleCloseDrawerClick = useCallback(() => {
    hideDrawer();
  }, [hideDrawer]);
  return (
    <_ToggleFade isActive={isActive}>
      <StyledContent ref={drawerRef} gap={16}>
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
        <VStack gap={16}>{content}</VStack>
      </StyledContent>
    </_ToggleFade>
  );
}

const fadeIn = keyframes`
    from { opacity: 0 };
    to { opacity: 1 };
`;

const fadeOut = keyframes`
    from { opacity: 1 };
    to { opacity: 0 };
`;

const _ToggleFade = styled.div<{ isActive: boolean }>`
  // keeps modal on top over other elements with z-index https://stackoverflow.com/questions/50883309/how-come-css-animations-change-z-index
  position: relative;
  // z-index: 11;
  animation: ${({ isActive }) =>
    css`
      ${isActive ? fadeIn : fadeOut} ${transitions.cubic}
    `};
  animation-fill-mode: forwards;
`;

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

const StyledContent = styled(VStack)`
  background-color: ${colors.offWhite};
  width: 100%;
  height: calc(100vh - 42px);
  overflow-y: scroll;
  overflow-x: hidden;
  overscroll-behavior: contain;

  @media only screen and ${breakpoints.tablet} {
    height: 100vh;
    // width: 375px;
    width: 420px;
  }
`;

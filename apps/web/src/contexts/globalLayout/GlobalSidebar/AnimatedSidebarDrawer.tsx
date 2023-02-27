import { ReactElement, useCallback, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import useDetectOutsideClick from '~/hooks/useDetectOutsideClick';
import CloseIcon from '~/icons/CloseIcon';

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
  }, []);
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
  z-index: 11;
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

const StyledHeadingText = styled(TitleDiatypeL)`
  font-size: 24px;
`;

const StyledContent = styled(VStack)`
  // width: 375px;
  width: 420px;
  height: 100vh;
  background-color: ${colors.offWhite};
`;

import { ReactElement, useCallback, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';

import colors from '~/components/core/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import useDetectOutsideClick from '~/hooks/useDetectOutsideClick';

type Props = {
  content: ReactElement;
  headerText?: string;
  hideDrawer: () => void;
};

export default function AnimatedSidebarDrawer({ content, hideDrawer, headerText }: Props) {
  const isActive = true;
  const drawerRef = useRef(null);

  useDetectOutsideClick(drawerRef, hideDrawer);
  const handleOverlayClick = useCallback(() => {
    console.log('close');
    hideDrawer();
  }, [hideDrawer]);
  return (
    <_ToggleFade isActive={isActive}>
      {/* <Overlay onClick={handleOverlayClick} /> */}
      <StyledContent ref={drawerRef}>
        <VStack gap={16}>
          {headerText && <TitleDiatypeL>{headerText}</TitleDiatypeL>}
          {content}
        </VStack>
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

const StyledContent = styled.div`
  width: 375px;
  // border: 1px solid red;
  height: 100vh;
  background-color: ${colors.offWhite};
`;

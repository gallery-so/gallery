import { ReactElement } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { MODAL_TRANSITION_MS } from './constants';
import colors from 'components/core/colors';

type Props = {
  isActive: boolean;
  hideModal: () => void;
  content: ReactElement;
};

function AnimatedModal({ isActive, hideModal, content }: Props) {
  return (
    <_ToggleFade isActive={isActive}>
      <Overlay onClick={hideModal} />
      <StyledContentContainer>
        <_ToggleTranslate isActive={isActive}>
          <StyledContent>
            <StyledClose onClick={hideModal}>&#x2715;</StyledClose>
            {content}
          </StyledContent>
        </_ToggleTranslate>
      </StyledContentContainer>
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

// ease-out like style
const transitionStyle = `${MODAL_TRANSITION_MS}ms cubic-bezier(0, 0, 0, 1.07)`;

const _ToggleFade = styled.div<{ isActive: boolean }>`
  animation: ${({ isActive }) =>
    css`
      ${isActive ? fadeIn : fadeOut} ${transitionStyle}
    `};
`;

const TRANSLATE_PIXELS = 10;

const translateUp = keyframes`
    from { transform: translateY(${TRANSLATE_PIXELS}px) };
    to { transform: translateY(0px) };
`;

const translateDown = keyframes`
    from { transform: translateY(0px) };
    to { transform: translateY(${TRANSLATE_PIXELS}px) };
`;

const _ToggleTranslate = styled.div<{ isActive: boolean }>`
  animation: ${({ isActive }) =>
    css`
      ${isActive ? translateUp : translateDown} ${transitionStyle}
    `};
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: white;
  opacity: 0.8;

  // should appear above rest of site
  z-index: 1;

  // fixes unusual opacity transition bug: https://stackoverflow.com/a/22648685
  -webkit-backface-visibility: hidden;
`;

const StyledContentContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  // should appear above the overlay
  z-index: 2;

  border: 1px solid ${colors.gray50};
`;

const StyledContent = styled.div`
  position: relative;
  padding: 40px;
  background: white;
`;

const StyledClose = styled.span`
  position: absolute;
  right: 0px;
  top: 0px;
  padding: 10px;
  cursor: pointer;
`;

export default AnimatedModal;

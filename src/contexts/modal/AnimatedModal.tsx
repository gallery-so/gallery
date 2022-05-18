import { ReactElement, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import colors from 'components/core/colors';
import transitions, { ANIMATED_COMPONENT_TRANSLATION_PIXELS } from 'components/core/transitions';
import breakpoints from 'components/core/breakpoints';
import { DecoratedCloseIcon } from 'src/icons/CloseIcon';

type Props = {
  isActive: boolean;
  hideModal: () => void;
  content: ReactElement;
  isFullPage: boolean;
};

function AnimatedModal({ isActive, hideModal, content, isFullPage }: Props) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // This is wrapped in a setTimeout so that any event that triggers showModal via escape does not cause jitter
        // E.g. CollectionEditor.tsx opens the modal via escape, and so trying to close here would jitter an open/close rapidly
        setTimeout(() => {
          hideModal();
        }, 150);
      }
    };

    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('keydown', close);
    };
  }, [hideModal]);

  return (
    <_ToggleFade isActive={isActive}>
      <Overlay onClick={hideModal} />
      <StyledContentContainer>
        <_ToggleTranslate isActive={isActive}>
          <StyledContent noPadding={isFullPage}>
            <StyledDecoratedCloseIcon onClick={hideModal} />
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

const _ToggleFade = styled.div<{ isActive: boolean }>`
  // keeps modal on top over other elements with z-index https://stackoverflow.com/questions/50883309/how-come-css-animations-change-z-index
  position: relative;
  z-index: 10;
  animation: ${({ isActive }) =>
    css`
      ${isActive ? fadeIn : fadeOut} ${transitions.cubic}
    `};
`;

const translateUp = keyframes`
    from { transform: translateY(${ANIMATED_COMPONENT_TRANSLATION_PIXELS}px) };
    to { transform: translateY(0px) };
`;

const translateDown = keyframes`
    from { transform: translateY(0px) };
    to { transform: translateY(${ANIMATED_COMPONENT_TRANSLATION_PIXELS}px) };
`;

const _ToggleTranslate = styled.div<{ isActive: boolean }>`
  animation: ${({ isActive }) =>
    css`
      ${isActive ? translateUp : translateDown} ${transitions.cubic}
    `};
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: ${colors.white};
  opacity: 0.95;

  // should appear above rest of site
  z-index: 1;

  // fixes unusual opacity transition bug: https://stackoverflow.com/a/22648685
  -webkit-backface-visibility: hidden;
`;

const StyledContentContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  @media only screen and ${breakpoints.tablet} {
    width: initial;
  }

  // should appear above the overlay
  z-index: 2;

  border: 1px solid ${colors.shadow};
`;

const StyledContent = styled.div<{ noPadding: boolean }>`
  position: relative;
  padding: ${({ noPadding }) => (noPadding ? 0 : 40)}px;
  background: ${colors.white};
`;

const StyledDecoratedCloseIcon = styled(DecoratedCloseIcon)`
  position: absolute;
  right: 0;
  top: 0;
`;

export default AnimatedModal;

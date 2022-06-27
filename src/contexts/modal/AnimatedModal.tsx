import { ReactElement, useCallback, useEffect, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import colors from 'components/core/colors';
import transitions, {
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE,
} from 'components/core/transitions';
import breakpoints from 'components/core/breakpoints';
import { DecoratedCloseIcon } from 'src/icons/CloseIcon';
import useKeyDown from 'hooks/useKeyDown';
import { ModalPaddingVariant, MODAL_PADDING_PX } from './constants';
import { TitleS } from 'components/core/Text/Text';

type Props = {
  isActive: boolean;
  hideModal: () => void;
  content: ReactElement;
  isFullPage: boolean;
  isMobile: boolean;
  isPaddingDisabled: boolean;
  headerText: string;
  headerVariant: ModalPaddingVariant;
};

function AnimatedModal({
  isActive,
  hideModal,
  content,
  isFullPage,
  isMobile,
  isPaddingDisabled,
  headerText,
  headerVariant,
}: Props) {
  // hide modal if user clicks Back
  useEffect(() => {
    function handlePopState() {
      hideModal();
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hideModal]);

  // this is wrapped in a setTimeout so that any event that triggers showModal
  // via escape does not cause jitter. e.g. CollectionEditor.tsx opens the modal
  // via escape, so trying to close here would jitter an open/close rapidly
  const delayedHideModal = useCallback(() => {
    setTimeout(hideModal, 150);
  }, [hideModal]);

  // hide modal if user clicks Escape
  useKeyDown('Escape', delayedHideModal);

  const padding = useMemo(() => {
    if (isFullPage || isPaddingDisabled) {
      return '0px';
    }
    return `${MODAL_PADDING_PX}px ${MODAL_PADDING_PX}px 12px`;
  }, [isFullPage, isPaddingDisabled]);

  const maxWidth = useMemo(() => {
    if (isFullPage) {
      return '100vw';
    }
    if (isMobile) {
      return `calc(100vw - ${MODAL_PADDING_PX * 2}px)`;
    }
    return `calc(100vw - ${MODAL_PADDING_PX}px)`;
  }, [isFullPage, isMobile]);

  return (
    <_ToggleFade isActive={isActive}>
      <Overlay onClick={hideModal} />
      <StyledContentContainer isFullPage={isFullPage}>
        <_ToggleTranslate isActive={isActive}>
          <StyledContent
            isFullPage={isFullPage}
            isPaddingDisabled={isPaddingDisabled}
            maxWidth={maxWidth}
            padding={padding}
          >
            <StyledHeader>
              {headerText ? <StyledTitleS>{headerText}</StyledTitleS> : null}
              <StyledDecoratedCloseIcon onClick={hideModal} variant={headerVariant} />
            </StyledHeader>
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
    from { transform: translateY(${ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE}px) };
    to { transform: translateY(0px) };
`;

const translateDown = keyframes`
    from { transform: translateY(0px) };
    to { transform: translateY(${ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE}px) };
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

const StyledContentContainer = styled.div<{ isFullPage: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  ${({ isFullPage }) => isFullPage && `height: 100%;`}

  @media only screen and ${breakpoints.tablet} {
    width: initial;
  }

  // should appear above the overlay
  z-index: 2;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: ${MODAL_PADDING_PX};
`;

const StyledTitleS = styled(TitleS)`
  padding-bottom: ${MODAL_PADDING_PX}px;
`;

const StyledContent = styled.div<{
  isFullPage: boolean;
  isPaddingDisabled: boolean;
  maxWidth: string;
  padding: string;
}>`
  position: relative;
  background: ${colors.white};
  ${({ isFullPage }) => isFullPage && `height: 100%;`}

  // allows for scrolling within child components
  overflow-y: auto;
  overflow-x: hidden;

  // no border on full page
  border: ${({ isFullPage }) => `${isFullPage ? 0 : 1}px solid ${colors.shadow}`};
  // no padding on full page
  max-height: ${({ isFullPage }) => `calc(100vh - ${isFullPage ? 0 : MODAL_PADDING_PX * 2}px)`};
  padding: ${({ padding }) => padding};
  max-width: ${({ maxWidth }) => maxWidth};
  // take up entire page on full page
  ${({ isFullPage }) =>
    isFullPage
      ? `
    width: 100vw;
    min-height: -webkit-fill-available;
  `
      : ''};
`;

const StyledDecoratedCloseIcon = styled(DecoratedCloseIcon)`
  z-index: 3;
  position: absolute;
  right: 0;
  top: 0;
`;

export default AnimatedModal;

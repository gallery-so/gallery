import { ReactElement, useCallback, useEffect, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import transitions, {
  ANIMATED_COMPONENT_TRANSITION_MS,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE,
} from '~/components/core/transitions';
import ErrorBoundary from '~/contexts/boundary/ErrorBoundary';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { DecoratedCloseIcon } from '~/icons/CloseIcon';
import colors from '~/shared/theme/colors';

import { MODAL_PADDING_PX, ModalPaddingVariant } from './constants';

export type AnimatedModalProps = {
  /**
   * `hideModal` and `dismountModal` are used separately.
   * hideModal begins the process for removing the modal, and
   * dismount actually removes it by the end of the animation.
   */
  hideModal: () => void;
  dismountModal: () => void;

  isActive: boolean;
  content: ReactElement;
  isFullPage: boolean;
  isPaddingDisabled: boolean;
  headerActions?: JSX.Element | false;
  headerText: string;
  headerVariant: ModalPaddingVariant;
  hideClose: boolean;
  onCloseOverride?: (onClose: () => void) => void;
};

function AnimatedModal({
  isActive,
  hideModal,
  dismountModal,
  content,
  isFullPage,
  isPaddingDisabled,
  headerActions,
  headerText,
  headerVariant,
  hideClose,
  onCloseOverride,
}: AnimatedModalProps) {
  useEffect(() => {
    if (!isActive) {
      setTimeout(dismountModal, ANIMATED_COMPONENT_TRANSITION_MS);
    }
  }, [isActive, dismountModal]);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const padding = useMemo(() => {
    if (isFullPage || isPaddingDisabled) {
      return '0px';
    }
    return `0px ${MODAL_PADDING_PX}px 12px`;
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

  // TODO: could consolidate maxWidth and width styles
  const width = useMemo(() => {
    if (isFullPage) {
      return '100vw';
    }
    if (isMobile) {
      return `calc(100vw - ${MODAL_PADDING_PX * 2}px)`;
    }
    return 'unset';
  }, [isFullPage, isMobile]);

  const handleClick = useCallback(() => {
    if (onCloseOverride) {
      onCloseOverride(hideModal);
      return;
    }
    hideModal();
  }, [onCloseOverride, hideModal]);

  return (
    <_ToggleFade isActive={isActive}>
      <Overlay onClick={handleClick} />
      <StyledModal isFullPage={isFullPage}>
        <_ToggleTranslate isActive={isActive}>
          <StyledContainer isFullPage={isFullPage} maxWidth={maxWidth} width={width}>
            <StyledHeader isPaddingDisabled={isPaddingDisabled}>
              {headerText ? <StyledTitleS>{headerText}</StyledTitleS> : null}
              <StyledModalActions align="center">
                {headerActions}
                {hideClose ? null : (
                  <DecoratedCloseIcon onClick={handleClick} variant={headerVariant} />
                )}
              </StyledModalActions>
            </StyledHeader>
            <ErrorBoundary>
              <StyledContent padding={padding}>{content}</StyledContent>
            </ErrorBoundary>
          </StyledContainer>
        </_ToggleTranslate>
      </StyledModal>
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
  animation-fill-mode: forwards;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: ${colors.white};
  opacity: 0.95;

  // should appear above rest of site
  z-index: 10;

  // fixes unusual opacity transition bug: https://stackoverflow.com/a/22648685
  -webkit-backface-visibility: hidden;
`;

const StyledModal = styled.div<{ isFullPage: boolean }>`
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
  z-index: 10;
`;

const StyledHeader = styled.div<{ isPaddingDisabled: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: ${({ isPaddingDisabled }) =>
    isPaddingDisabled ? '0px' : `${MODAL_PADDING_PX}px ${MODAL_PADDING_PX}px 0px`};
  padding-bottom: ${MODAL_PADDING_PX};
`;

const StyledTitleS = styled(TitleS)`
  padding-bottom: ${MODAL_PADDING_PX}px;
`;

const StyledContainer = styled.div<{
  isFullPage: boolean;
  maxWidth: string;
  width: string;
}>`
  position: relative;
  background: ${colors.white};
  ${({ isFullPage }) => isFullPage && `height: 100%;`}

  // allows for scrolling within child components
  overflow-y: auto;
  overflow-x: hidden;

  // no border on full page
  border: ${({ isFullPage }) => `${isFullPage ? 0 : 1}px solid ${colors.shadow}`};
  max-height: ${({ isFullPage }) => `calc(100vh - ${isFullPage ? 0 : MODAL_PADDING_PX * 2}px)`};
  min-height: ${({ isFullPage }) => (isFullPage ? '-webkit-fill-available' : 'unset')};
  max-width: ${({ maxWidth }) => maxWidth};
  width: ${({ width }) => width};
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const StyledContent = styled.div<{ padding: string }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${({ padding }) => padding};
`;

const StyledModalActions = styled(HStack)`
  z-index: 3;
  position: absolute;
  right: 0;
  top: 0;
`;

export default AnimatedModal;

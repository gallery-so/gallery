import colors from 'components/core/colors';
import { BaseM } from 'components/core/Text/Text';
import transitions, {
  ANIMATED_COMPONENT_TRANSITION_MS,
  ANIMATED_COMPONENT_TIMEOUT_MS,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
} from 'components/core/transitions';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

type Props = {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
};

const noop = () => {};

export function AnimatedToast({ message, onClose = noop, autoClose = true }: Props) {
  // Pseudo-state for signaling animations. this will allow us
  // to display an animation prior to unmounting
  // This initializes as true so that there is not a jitter in the animation (if it were false, this would trigger the wrong CSS animation initially)
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setIsActive(true);

    if (autoClose) {
      setTimeout(() => {
        setIsActive(false);
        setTimeout(onClose, ANIMATED_COMPONENT_TRANSITION_MS);
      }, ANIMATED_COMPONENT_TIMEOUT_MS);
    }
  }, [autoClose, onClose]);

  const handleClose = useCallback(() => {
    setIsActive(false);
    setTimeout(onClose, ANIMATED_COMPONENT_TRANSITION_MS);
  }, [onClose]);

  return (
    <_Animate isActive={isActive}>
      <Toast message={message} onClose={handleClose} />
    </_Animate>
  );
}

const translateUpAndFadeIn = keyframes`
    from { opacity: 0; transform: translateY(${ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL}px); }
    to { opacity: 1; transform: translateY(0px); }
`;

const translateDownAndFadeOut = keyframes`
    from { opacity: 1; transform: translateY(0px); }
    to { opacity: 0; transform: translateY(${ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL}px); }
`;

const _Animate = styled.div<{ isActive: boolean }>`
  z-index: 51; // appears above wizard footer for onboarding / welcome gallery
  animation: ${({ isActive }) => css`
    ${isActive ? translateUpAndFadeIn : translateDownAndFadeOut} ${transitions.cubic}
  `};
  animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  animation-fill-mode: forwards;

  position: fixed;
  bottom: 24px;
  right: 24px;
  left: 24px;
`;

function Toast({ message, onClose }: Props) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <ToastContainer>
      <StyledToast>
        <BaseM>{message}</BaseM>
        <StyledClose onClick={handleClose}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.6667 3.33334L3.33337 12.6667" stroke="#141414" strokeMiterlimit="10" />
            <path d="M3.33337 3.33334L12.6667 12.6667" stroke="#141414" strokeMiterlimit="10" />
          </svg>
        </StyledClose>
      </StyledToast>
    </ToastContainer>
  );
}

const ToastContainer = styled.div`
  z-index: 2; // appears above navbar
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledToast = styled.div`
  display: flex;
  align-items: center;

  border: 1px solid black;
  padding: 8px 10px 8px 16px;
  max-width: min(80vw, 628px); // Set width of toast to 80% of viewport
  background: ${colors.white};
`;

const StyledClose = styled.button`
  display: flex;
  align-items: center;
  margin-left: 8px;
  cursor: pointer;

  background: none;
  border: none;
  padding: 0;
`;

export default Toast;

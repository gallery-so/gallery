import colors from 'components/core/colors';
import { BaseM } from 'components/core/Text/Text';
import transitions, {
  ANIMATED_COMPONENT_TRANSITION_MS,
  ANIMATED_COMPONENT_TIMEOUT_MS,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS,
} from 'components/core/transitions';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

type Props = {
  message: string;
  cornerPositioned?: boolean;
  onClose?: () => void;
  autoClose?: boolean;
};

const noop = () => {};

export function AnimatedToast({
  message,
  cornerPositioned = true,
  onClose = noop,
  autoClose = false,
}: Props) {
  // Pseudo-state for signaling animations. this will allow us
  // to display an animation prior to unmounting
  const [isActive, setIsActive] = useState(false);

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
      <Toast message={message} onClose={handleClose} cornerPositioned={cornerPositioned} />
    </_Animate>
  );
}

const translateUpAndFadeIn = keyframes`
    from { opacity: 0; transform: translateY(${ANIMATED_COMPONENT_TRANSLATION_PIXELS}px); };
    to { opacity: 1; transform: translateY(0px); };
`;

const translateDownAndFadeOut = keyframes`
    from { opacity: 1; transform: translateY(0px); };
    to { opacity: 0; transform: translateY(${ANIMATED_COMPONENT_TRANSLATION_PIXELS}px); };
`;

const _Animate = styled.div<{ isActive: boolean }>`
  z-index: 51; // appears above wizard footer for onboarding / welcome gallery
  animation: ${({ isActive }) => css`
    ${isActive ? translateUpAndFadeIn : translateDownAndFadeOut} ${transitions.cubic}
  `};
  animation-fill-mode: forwards;

  position: fixed;
  bottom: 24px;
  right: 24px;
  left: 24px;
`;

function Toast({ message, onClose, cornerPositioned }: Props) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const pill = useMemo(
    () => (
      <StyledToast>
        <StyledClose onClick={handleClose}>&#x2715;</StyledClose>
        <BaseM>{message}</BaseM>
      </StyledToast>
    ),
    [handleClose, message]
  );

  if (cornerPositioned) {
    return <CornerPosition>{pill}</CornerPosition>;
  }

  return pill;
}

const CornerPosition = styled.div`
  z-index: 2; // appears above navbar
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledToast = styled.div`
  position: relative;
  border: 1px solid black;
  padding: 16px 40px 16px 24px;
  max-width: 80vw; // Set width of toast to 80% of viewport
  background: ${colors.white};
`;

const StyledClose = styled.span`
  position: absolute;
  right: 6px;
  top: 7px;
  padding: 10px;
  cursor: pointer;
`;

export default Toast;

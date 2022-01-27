import { BodyRegular } from 'components/core/Text/Text';
import transitions, { ANIMATED_COMPONENT_TRANSITION_MS } from 'components/core/transitions';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

type Props = {
  message: string;
  cornerPositioned?: boolean;
  onClose?: () => void;
};

const noop = () => {};

export function AnimatedToast({ message, cornerPositioned = true, onClose = noop }: Props) {
  // Pseudo-state for signaling animations. this will allow us
  // to display an animation prior to unmounting
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
  }, []);

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
    from { opacity: 0; transform: translateY(8px); };
    to { opacity: 1; transform: translateY(0px); };
`;

const translateDownAndFadeOut = keyframes`
    from { opacity: 1; transform: translateY(0px); };
    to { opacity: 0; transform: translateY(8px); };
`;

const _Animate = styled.div<{ isActive: boolean }>`
  z-index: 20;
  position: relative;
  animation: ${({ isActive }) => css`
    ${isActive ? translateUpAndFadeIn : translateDownAndFadeOut} ${transitions.cubic}
  `};
  animation-fill-mode: forwards;
`;

function Toast({ message, onClose, cornerPositioned }: Props) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const pill = useMemo(
    () => (
      <StyledToast>
        <StyledClose onClick={handleClose}>&#x2715;</StyledClose>
        <BodyRegular>{message}</BodyRegular>
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
  position: fixed;
  top: 24px;
  right: 24px;
`;

const StyledToast = styled.div`
  position: relative;
  border: 1px solid black;
  padding: 16px 32px 16px 24px;
  width: 288px;
  background: white;
`;

const StyledClose = styled.span`
  position: absolute;
  right: 6px;
  top: 7px;
  padding: 10px;
  cursor: pointer;
`;

export default Toast;

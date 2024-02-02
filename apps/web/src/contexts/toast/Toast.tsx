import { useCallback, useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import IconContainer from '~/components/core/IconContainer';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import transitions, {
  ANIMATED_COMPONENT_TIMEOUT_MS,
  ANIMATED_COMPONENT_TRANSITION_MS,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
} from '~/components/core/transitions';
import AlertIcon from '~/icons/AlertIcon';
import CloseIcon from '~/icons/CloseIcon';
import colors from '~/shared/theme/colors';
import { noop } from '~/shared/utils/noop';

import { ToastButtonProps } from './ToastContext';

type Props = {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  variant?: 'success' | 'error';
  buttonProps?: ToastButtonProps;
};

export function AnimatedToast({
  message,
  onClose = noop,
  autoClose = true,
  variant = 'success',
  buttonProps,
}: Props) {
  // Pseudo-state for signaling animations. this will allow us
  // to display an animation prior to unmounting
  // This initializes as true so that there is not a jitter in the animation (if it were false, this would trigger the wrong CSS animation initially)
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setIsActive(true);

    if (autoClose) {
      const timeoutId = setTimeout(() => {
        setIsActive(false);
        setTimeout(onClose, ANIMATED_COMPONENT_TRANSITION_MS);
      }, ANIMATED_COMPONENT_TIMEOUT_MS);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [autoClose, onClose]);

  const handleClose = useCallback(() => {
    setIsActive(false);
    setTimeout(onClose, ANIMATED_COMPONENT_TRANSITION_MS);
  }, [onClose]);

  return (
    <_Animate isActive={isActive}>
      <Toast message={message} onClose={handleClose} variant={variant} buttonProps={buttonProps} />
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

  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 16px;
`;

function Toast({ message, onClose, variant, buttonProps }: Props) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <ToastContainer>
      <StyledToast align="center" gap={8} variant={variant}>
        <StyledToastContent gap={16} align="center">
          {variant === 'error' && (
            <StyledAlertIcon>
              <AlertIcon />
            </StyledAlertIcon>
          )}
          <StyledMessage>
            <Markdown
              text={message}
              // we wouldn't render a link in a toast
              eventContext={null}
            />
          </StyledMessage>
          {buttonProps && (
            <StyledButton onClick={buttonProps.onClick} {...buttonProps.eventProperties}>
              <StyledButtonText color={colors.white}>{buttonProps.label}</StyledButtonText>
            </StyledButton>
          )}
          <IconContainer variant="default" onClick={handleClose} size="sm" icon={<CloseIcon />} />
        </StyledToastContent>
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

const StyledToast = styled(HStack)<{ variant: Props['variant'] }>`
  border: 1px solid ${({ variant }) => (variant === 'error' ? colors.red : colors.black['800'])};
  padding: 6px 10px 6px 16px;
  max-width: min(80vw, 628px); // Set width of toast to 80% of viewport
  background: ${colors.white};

  pointer-events: auto;
`;

const StyledToastContent = styled(HStack)`
  width: 100%;
`;

const StyledAlertIcon = styled(VStack)`
  height: 24px;
  width: 24px;
`;

const StyledMessage = styled(BaseM)`
  overflow: hidden; // prevent dynamic content from extending beyond toast
`;

const StyledButton = styled(Button)`
  margin-left: 16px;
  padding: 4px 32px;
  border-radius: 2px;
  @media only screen and ${breakpoints.tablet} {
    margin-left: 64px; // use margin instead of gap because all of the toast's content children needed to be direct siblings to shrink to fit, and we don't want a 64px gap between everything
  }
`;

const StyledButtonText = styled(TitleXS)`
  text-transform: capitalize;
  font-weight: 700;
  white-space: nowrap;
`;

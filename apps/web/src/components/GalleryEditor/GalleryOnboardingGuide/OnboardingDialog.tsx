import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  Placement,
  shift,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '~/components/core/transitions';
import CloseIcon from '~/icons/CloseIcon';
import colors from '~/shared/theme/colors';

import Blinking from './Blinking';
import { FINAL_STEP } from './OnboardingDialogContext';

type Props = {
  step: number;
  text: string;
  onNext: () => void;
  onClose: () => void;

  options?: {
    placement?: Placement;
    positionOffset?: number;
    blinkingPosition?: {
      top?: number;
      left?: number;
      right?: number;
      bottom?: number;
    };
  };
};

export default function OnboardingDialog({ step, text, onNext, onClose, options }: Props) {
  const [open, setOpen] = useState(true);

  const { placement, positionOffset, blinkingPosition } = options ?? {
    placement: 'right-start',
    positionOffset: 10,
  };

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement,
    open: open,
    onOpenChange: setOpen,
    middleware: [flip(), shift(), offset(positionOffset)],
    whileElementsMounted: autoUpdate,
  });

  // Role props for screen readers
  const role = useRole(context, { role: 'tooltip' });

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([role]);
  const headingId = useId();

  const handleNext = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      onNext();
    },
    [onNext]
  );

  const handleOnClose = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setOpen(false);
      onClose();
    },
    [onClose]
  );

  if (!open) {
    return null;
  }

  return (
    <>
      <StyledBlinkingContainer position={blinkingPosition}>
        <Blinking ref={reference} {...getReferenceProps()} />
      </StyledBlinkingContainer>
      <AnimatePresence>
        <FloatingPortal>
          <StyledConfirmation
            className="Popover"
            aria-labelledby={headingId}
            ref={floating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 500,
            }}
            {...getFloatingProps()}
            // Framer Motion Props
            transition={{
              duration: ANIMATED_COMPONENT_TRANSITION_S,
              ease: rawTransitions.cubicValues,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL }}
            exit={{ opacity: 0, y: 0 }}
          >
            <HStack justify="flex-end">
              <IconContainer
                onClick={(e) => handleOnClose(e)}
                size="sm"
                variant="stacked"
                icon={<CloseIcon />}
              />
            </HStack>
            <StyledTextWrapper>
              <BaseM>{text}</BaseM>
            </StyledTextWrapper>
            <HStack justify="space-between" align="center">
              <TitleDiatypeM>
                Tip {step} of {FINAL_STEP}
              </TitleDiatypeM>
              <StyledButton
                // events will be tracked via OnboardingDialogContext
                eventElementId={null}
                eventName={null}
                onClick={handleNext}
              >
                {step === FINAL_STEP ? 'Finish' : 'Next'}{' '}
              </StyledButton>
            </HStack>
          </StyledConfirmation>
        </FloatingPortal>
      </AnimatePresence>
    </>
  );
}

const StyledBlinkingContainer = styled.div<{
  position?: { top?: number; left?: number; right?: number; bottom?: number };
}>`
  position: absolute;
  top: ${({ position }) => (position?.top ? `${position.top}px` : 'auto')};
  right: ${({ position }) => (position?.right ? `${position.right}px` : 'auto')};
  bottom: ${({ position }) => (position?.bottom ? `${position.bottom}px` : 'auto')};
  left: ${({ position }) => (position?.left ? `${position.left}px` : 'auto')};
`;

const StyledConfirmation = styled(motion.div)`
  width: 311px;
  max-width: 100%;
  z-index: 12;

  background-color: ${colors.white};
  padding: 16px;

  border: 1px solid ${colors.black['800']};
`;

const StyledTextWrapper = styled.div`
  padding: 16px 0 28px;
`;

const StyledButton = styled(Button)`
  width: 64px;
`;

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
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';

import Blinking from './Blinking';

type Props = {
  step: number;
  text: string;
  onNext: () => void;

  options?: {
    placement?: Placement;
    positionOffset?: number;
  };
};

export default function OnboardingDialog({ step, text, onNext, options }: Props) {
  const [open, setOpen] = useState(true);

  const { placement, positionOffset } = options ?? {
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

  return (
    <>
      <Blinking ref={reference} {...getReferenceProps()} />
      {open && (
        <FloatingPortal>
          <StyledConfirmation
            className="Popover"
            aria-labelledby={headingId}
            // Floating UI Props
            ref={floating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 500,
            }}
            {...getFloatingProps()}
          >
            <StyledTextWrapper>
              <BaseM>{text}</BaseM>
            </StyledTextWrapper>
            <HStack justify="space-between" align="center">
              <TitleDiatypeM>Tip {step} of 5</TitleDiatypeM>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  // setOpen(false);
                  onNext();
                }}
              >
                Next
              </Button>
            </HStack>
          </StyledConfirmation>
        </FloatingPortal>
      )}
    </>
  );
}

const StyledConfirmation = styled.div`
  width: 311px;
  max-width: 100%;
  padding-top: 16px;
  z-index: 2;

  background-color: ${colors.white};
  padding: 20px;

  border: 1px solid ${colors.offBlack};
`;

const StyledTextWrapper = styled.div`
  padding: 16px 0;
`;

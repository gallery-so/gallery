import { MouseEventHandler, ReactNode, useCallback } from 'react';
import { VStack } from 'components/core/Spacer/Stack';
import styled, { css } from 'styled-components';
import colors from 'components/core/colors';

type Props = {
  active: boolean;
  onClose: () => void;
  children?: ReactNode;
  position: 'right' | 'left';
};

export function Dropdown({ active, onClose, children, position }: Props) {
  const handleClose = useCallback<MouseEventHandler>(
    (event) => {
      event.stopPropagation();

      onClose();
    },
    [onClose]
  );

  return (
    <>
      {/* Used to hijack click events on things outside of the dropdown */}
      {active && <Backdrop onClick={handleClose} />}

      <DropdownContainer position={position} active={active}>
        {children}
      </DropdownContainer>
    </>
  );
}

const Backdrop = styled.div`
  cursor: default;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
`;

const DropdownContainer = styled(VStack)<{ active: boolean; position: 'right' | 'left' }>`
  position: absolute;
  z-index: 10;
  top: 100%;

  ${({ position }) =>
    position === 'right'
      ? css`
          right: 0;
        `
      : css`
          left: 0;
        `}

  background-color: ${colors.white};

  border: 1px solid ${colors.offBlack};
  padding: 0 4px;

  > *:not(:last-child) {
    border-bottom: 1px solid ${colors.faint};
  }

  transition: transform 250ms ease-out, opacity 250ms linear;

  ${({ active }) =>
    active
      ? css`
          transform: translateY(8px);
          opacity: 1;
        `
      : css`
          transform: translateY(4px);
          pointer-events: none;
          opacity: 0;
        `}
`;

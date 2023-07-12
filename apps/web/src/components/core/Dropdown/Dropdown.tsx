import { MouseEventHandler, ReactNode, useCallback } from 'react';
import styled, { css } from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import colors from '~/shared/theme/colors';

type Props = {
  active: boolean;
  onClose: () => void;

  onMouseLeave?: () => void;
  onMouseEnter?: () => void;

  isActivatedByHover?: boolean;

  children?: ReactNode;
  position: 'right' | 'left' | 'full-width';

  className?: string;
};

export function Dropdown({
  active,
  onClose,
  children,
  position,
  onMouseLeave,
  onMouseEnter,
  isActivatedByHover,
  className,
}: Props) {
  const handleClose = useCallback<MouseEventHandler>(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      onClose();
    },
    [onClose]
  );

  return (
    <>
      {/* Used to hijack click events on things outside of the dropdown */}
      {/* We don't want this here if we're showing the dropdown with a hover */}
      {/* otherwise we'll never get a mouseleave event on the triggering element */}
      {active && !isActivatedByHover && <Backdrop onClick={handleClose} />}

      <DropdownContainer
        className={className}
        position={position}
        active={active}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
      >
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

const DropdownContainer = styled(VStack)<{
  active: boolean;
  position: 'right' | 'left' | 'full-width';
}>`
  position: absolute;
  z-index: 10;
  top: 100%;

  ${({ position }) =>
    position === 'right'
      ? css`
          right: 0;
        `
      : position === 'left'
      ? css`
          left: 0;
        `
      : css`
          width: 100%;
        `}

  background-color: ${colors.white};

  border: 1px solid ${colors.black['800']};
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

import React from 'react';
import styled, { css } from 'styled-components';

import colors from '../colors';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  size?: Size;
  stacked?: boolean;
  disabled?: boolean;
  className?: string;
  icon: React.ReactElement;
} & Omit<JSX.IntrinsicElements['div'], 'ref'>;

export default function IconContainer({
  icon,
  onClick,
  stacked,
  disabled,
  className,
  size = 'md',

  ...props
}: Props) {
  return (
    <StyledIcon
      onClick={onClick}
      size={size}
      disabled={disabled}
      className={className}
      stacked={stacked}
      onMouseDown={(e) => {
        // This will prevent the textarea from losing focus when user clicks a markdown icon
        e.preventDefault();
      }}
      {...props}
    >
      {icon}
    </StyledIcon>
  );
}

const StyledIcon = styled.div<{
  size: Size;
  disabled?: boolean;
  stacked?: boolean;
}>`
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  ${({ disabled }) =>
    disabled
      ? css`
          color: ${colors.porcelain};
        `
      : css`
          color: ${colors.offBlack};
        `}

  ${({ size }) => {
    if (size === 'sm') {
      return css`
        height: 24px;
        width: 24px;

        border-radius: 99999999px;
      `;
    } else if (size === 'md') {
      return css`
        height: 32px;
        width: 32px;

        border-radius: 99999999px;
      `;
    } else if (size === 'lg') {
      return css`
        height: 40px;
        width: 40px;

        border-radius: 99999999px;
      `;
    }
  }}


  &:hover {
    ${({ disabled, stacked }) =>
      disabled
        ? null
        : css`
            background: ${stacked ? colors.porcelain : colors.faint};
          `}
  }

  &:active {
    background: ${colors.porcelain};
  }
`;

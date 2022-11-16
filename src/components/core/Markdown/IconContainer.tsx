import React from 'react';
import styled, { css } from 'styled-components';

import colors from '../colors';

type Size = 'sm' | 'md' | 'lg';

export default function IconContainer({
  icon,
  className,
  onClick,
  size = 'md',
}: {
  onClick?: () => void;
  icon: React.ReactElement;
  className?: string;
  size?: Size;
}) {
  return (
    <StyledIcon
      onClick={onClick}
      size={size}
      className={className}
      onMouseDown={(e) => {
        // This will prevent the textarea from losing focus when user clicks a markdown icon
        e.preventDefault();
      }}
    >
      {icon}
    </StyledIcon>
  );
}

const StyledIcon = styled.div<{ size: Size }>`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  ${({ size }) => {
    if (size === 'sm') {
      return css`
        height: 24px;
        width: 24px;
      `;
    } else if (size === 'md') {
      return css`
        height: 32px;
        width: 32px;
      `;
    } else if (size === 'lg') {
      return css`
        height: 40px;
        width: 40px;
      `;
    }
  }}

  color: ${colors.offBlack};

  &:hover {
    background: ${colors.faint};
  }

  &:active {
    background: ${colors.metal};
  }
`;

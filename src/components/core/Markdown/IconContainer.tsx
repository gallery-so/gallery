import React from 'react';
import styled from 'styled-components';
import colors from '../colors';

export default function IconContainer({
  icon,
  className,
}: {
  icon: React.ReactElement;
  className?: string;
}) {
  return (
    <StyledIcon
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

const StyledIcon = styled.div`
  cursor: pointer;
  height: 24px;

  &:hover {
    background: ${colors.porcelain};
  }

  &:active {
    background: ${colors.metal};
  }
`;

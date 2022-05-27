import React from 'react';
import styled from 'styled-components';
import colors from '../colors';

export default function IconContainer({ icon }: { icon: React.ReactElement }) {
  return (
    <StyledIcon
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

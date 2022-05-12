import React from 'react';
import styled from 'styled-components';

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

  & svg rect {
    transition: fill 300ms ease;
    fill: rgba(254, 254, 254, 1);
  }

  &:hover svg rect {
    fill: rgba(249, 249, 249, 1);
  }

  &:active svg rect {
    fill: rgba(226, 226, 226, 1);
  }
`;

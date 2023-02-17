import { ReactElement } from 'react';
import styled from 'styled-components';

type GlobalSidebarProps = {
  content: ReactElement | null;
};

export default function GlobalSidebar({ content }: GlobalSidebarProps) {
  return content ? <StyledSidebar>{content}</StyledSidebar> : null;
}

const StyledSidebar = styled.div`
  position: fixed;
  width: 64px;
  height: 100vh;
  border: 1px solid blue;
`;

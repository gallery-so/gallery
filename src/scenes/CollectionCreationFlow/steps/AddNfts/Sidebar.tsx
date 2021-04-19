import { memo } from 'react';
import styled from 'styled-components';

function Sidebar() {
  return <StyledSidebar>Your NFTs</StyledSidebar>;
}

const StyledSidebar = styled.div`
  width: 280px;
  height: 100vh;
  background: #f7f7f7;

  overflow: scroll;
`;

export default memo(Sidebar);

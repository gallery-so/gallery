import { memo } from 'react';
import styled from 'styled-components';
import LoggedOutNav from './LoggedOutNav';
import LoggedInNav from './LoggedInNav';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';

function GlobalNavbar() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <StyledNavContainer data-testid="navbar">
      <StyledNav>
        {isAuthenticated ? <LoggedInNav /> : <LoggedOutNav />}
      </StyledNav>
    </StyledNavContainer>
  );
}

const StyledNavContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;

  z-index: 1;
`;

const StyledNav = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 32px 40px;
`;

export default memo(GlobalNavbar);

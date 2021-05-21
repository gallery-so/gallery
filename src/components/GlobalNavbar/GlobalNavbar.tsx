import { memo } from 'react';
import styled from 'styled-components';
import LoggedOutNav from './LoggedOutNav';
import LoggedInNav from './LoggedInNav';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import breakpoints, { pageGutter } from 'components/core/breakpoints';

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
  margin: 32px ${pageGutter.mobile}px 0;

  @media only screen and ${breakpoints.tablet} {
    margin: 32px ${pageGutter.tablet}px 0;
  }

  @media only screen and ${breakpoints.desktop} {
    margin: 32px;
  }
`;

export default memo(GlobalNavbar);

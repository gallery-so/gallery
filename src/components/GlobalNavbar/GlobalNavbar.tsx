import styled from 'styled-components';
import SignInButton from './SignInButton';
import SignOutButton from './SignOutButton';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';

function GlobalNavbar() {
  const isAuthenticated = useIsAuthenticated();

  // hiding navbar for now
  return true ? null : (
    <StyledNavContainer>
      <StyledNav>
        {isAuthenticated ? <SignOutButton /> : <SignInButton />}
      </StyledNav>
    </StyledNavContainer>
  );
}

const StyledNavContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 80px;
  width: 100%;
  display: flex;
`;

const StyledNav = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: flex-end;
`;

export default GlobalNavbar;

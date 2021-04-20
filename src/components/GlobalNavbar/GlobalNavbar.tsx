import { useAuthState } from 'contexts/auth/AuthContext';
import { isLoggedInState } from 'contexts/auth/types';
import styled from 'styled-components';
import SignInButton from './SignInButton';
import SignOutButton from './SignOutButton';

function GlobalNavbar() {
  const authState = useAuthState();
  const isLoggedIn = isLoggedInState(authState);
  return (
    <StyledNavContainer>
      {/* <StyledNav>{isLoggedIn ? <SignOutButton /> : <SignInButton />}</StyledNav> */}
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

import { useAuthState } from 'contexts/auth/AuthContext';
import styled from 'styled-components';
import SignInButton from './SignInButton';
import SignOutButton from './SignOutButton';

function GlobalNavbar() {
  const authState = useAuthState();
  console.log(typeof authState);
  const isLoggedIn = typeof authState === 'object';
  return (
    <StyledNavContainer>
      <StyledNav>{isLoggedIn ? <SignOutButton /> : <SignInButton />}</StyledNav>
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

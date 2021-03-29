import styled from 'styled-components';
import SigninButton from './SigninButton';

function GlobalNavbar() {
  return (
    <StyledNavContainer>
      <StyledNav>
        <SigninButton />
      </StyledNav>
    </StyledNavContainer>
  );
}

const StyledNavContainer = styled.div`
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

import styled from 'styled-components';
import { useAuthActions } from 'contexts/auth/AuthContext';

function SignOutButton() {
  const { logOut } = useAuthActions();
  return <StyledButton onClick={logOut}>Sign Out</StyledButton>;
}

const StyledButton = styled.button`
  padding: 8px 16px;
  border-style: none;
  text-transform: uppercase;
  background: black;
  color: white;
  cursor: pointer;
`;

export default SignOutButton;

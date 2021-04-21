import { navigate, Redirect, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import ActionText from 'components/core/ActionText/ActionText';
import { useCallback } from 'react';
import { useAuthState } from 'contexts/auth/AuthContext';
import { isLoggedInState } from 'contexts/auth/types';

function Welcome(_: RouteComponentProps) {
  const authState = useAuthState();
  const isLoggedIn = isLoggedInState(authState);

  const handleClick = useCallback(() => {
    navigate('/create');
  }, []);

  if (!isLoggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <StyledWelcome>
      <StyledActionText>YOU ARE PICASSO</StyledActionText>
      <button onClick={handleClick}></button>
    </StyledWelcome>
  );
}
const StyledActionText = styled(ActionText)`
  font-size: 100px;
`;
const StyledWelcome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 140px;
`;

export default Welcome;

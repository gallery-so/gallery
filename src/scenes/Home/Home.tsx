import { navigate, Redirect, RouteComponentProps } from '@reach/router';
import { memo, useCallback } from 'react';
import styled from 'styled-components';
import useIsPasswordValidated from 'hooks/useIsPasswordValidated';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import { Text } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import Button from 'components/core/Button/Button';

function Home(_: RouteComponentProps) {
  // whether the user has entered the correct password
  const isPasswordValidated = useIsPasswordValidated();
  // whether the user is web3-authenticated
  const isAuthenticated = useIsAuthenticated();
  // TODO: useIsAuthenticated should return the username (or wallet address)
  // if indeed authenticated - we should redirect there
  const username = '0x70d04384b5c3a466ec4d8cfb8213efc31c6a9d15';

  const handleRedirectToProfile = useCallback(() => {
    navigate(`/${username}`);
  }, []);

  if (!isPasswordValidated) {
    return <Redirect to="/password" />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  return (
    <StyledHome>
      <StyledHeader>GALLERY</StyledHeader>
      <Text>Show your collection to the world</Text>
      <Spacer height={80} />
      <StyledButton text="Enter" onClick={handleRedirectToProfile} />
    </StyledHome>
  );
}

const StyledHome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const StyledHeader = styled.p`
  text-align: center;
  color: black;
  font-size: 50px;
  margin: 0;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;

export default memo(Home);

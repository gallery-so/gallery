import { navigate, Redirect, RouteComponentProps } from '@reach/router';
import { memo, useCallback } from 'react';
import styled from 'styled-components';
import useIsPasswordValidated from 'hooks/useIsPasswordValidated';
import { Text } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import Button from 'components/core/Button/Button';

function Home(_: RouteComponentProps) {
  // whether the user has entered the correct password
  const isPasswordValidated = useIsPasswordValidated();

  const handleEnterGallery = useCallback(() => {
    // if the user is already authenticated, /auth will handle forwarding
    // them directly to their profile
    navigate('/auth');
  }, []);

  if (!isPasswordValidated) {
    return <Redirect to="/password" />;
  }

  return (
    <StyledHome>
      <StyledHeader>GALLERY</StyledHeader>
      <Text>Show your collection to the world</Text>
      <Spacer height={80} />
      <StyledButton text="Enter" onClick={handleEnterGallery} />
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

import { navigate, Redirect, RouteComponentProps } from '@reach/router';
import { memo, useCallback } from 'react';
import styled from 'styled-components';
import useIsPasswordValidated from 'hooks/useIsPasswordValidated';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Page from 'components/core/Page/Page';

function Home(_: RouteComponentProps) {
  // whether the user has entered the correct password
  const isPasswordValidated = useIsPasswordValidated();

  const handleEnterGallery = useCallback(() => {
    // if the user is already authenticated, /auth will handle forwarding
    // them directly to their profile
    navigate('/auth');
  }, []);

  if (!isPasswordValidated) {
    return <Redirect to="/password" noThrow />;
  }

  return (
    <Page centered withRoomForFooter={false}>
      <Display caps>GALLERY</Display>
      <Spacer height={8} />
      <BodyRegular color={colors.gray50}>
        Show your collection to the world
      </BodyRegular>
      <Spacer height={24} />
      <StyledButton text="Enter" onClick={handleEnterGallery} />
    </Page>
  );
}

const StyledButton = styled(Button)`
  width: 200px;
`;

export default memo(Home);

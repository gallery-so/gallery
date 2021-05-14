import { useCallback } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';
import { useAuthActions } from 'contexts/auth/AuthContext';
import TextButton from 'components/core/Button/TextButton';
import Dropdown from 'components/core/Dropdown/Dropdown';

function UnauthenticatedNav() {
  const { logOut } = useAuthActions();

  const handleGalleryRedirect = useCallback(() => {
    // TODO: when backend/usercontext is ready, hook up address from useUser
    navigate('/link-to-my-gallery');
  }, []);

  const handleWalletAddressRedirect = useCallback(() => {
    alert('TODO!');
  }, []);

  return (
    <Container>
      <TextButton onClick={handleGalleryRedirect} text="My Gallery" />
      <Dropdown mainText="Account">
        <TextButton text="0xBb...3255" onClick={handleWalletAddressRedirect} />
        <TextButton text="Sign Out" onClick={logOut} />
      </Dropdown>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
`;

export default UnauthenticatedNav;

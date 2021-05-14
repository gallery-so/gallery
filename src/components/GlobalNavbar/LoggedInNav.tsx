import { useCallback } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';
import { useAuthActions } from 'contexts/auth/AuthContext';
import TextButton from 'components/core/Button/TextButton';
import Dropdown from 'components/core/Dropdown/Dropdown';
import Spacer from 'components/core/Spacer/Spacer';

function LoggedInNav() {
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
      <Spacer width={24} />
      <Dropdown mainText="Account">
        <StyledTextButton
          text="0xBb...3255"
          onClick={handleWalletAddressRedirect}
        />
        <Spacer height={12} />
        <TextButton text="Sign Out" onClick={logOut} underlineOnHover />
      </Dropdown>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
`;

const StyledTextButton = styled(TextButton)`
  text-decoration: underline;
`;

export default LoggedInNav;

import { useCallback, useMemo } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';
import { useAuthActions } from 'contexts/auth/AuthContext';
import TextButton from 'components/core/Button/TextButton';
import Dropdown from 'components/core/Dropdown/Dropdown';
import Spacer from 'components/core/Spacer/Spacer';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import { useAuthenticatedUser } from 'hooks/api/users/useUser';
import { User } from 'types/User';

function truncate(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function LoggedInNav() {
  const { logOut } = useAuthActions();
  const user = useAuthenticatedUser() as User;

  let userAddresses = user.addresses || [];

  if (!userAddresses[0]) {
    console.error('User is missing addresses');
  }

  const walletAddress = userAddresses[0] || '';
  const truncatedAddress = useMemo(() => {
    return truncate(walletAddress);
  }, [walletAddress]);

  const handleGalleryRedirect = useCallback(() => {
    navigate(`/${user.username}`);
  }, [user.username]);

  return (
    <Container>
      <TextButton onClick={handleGalleryRedirect} text="My Gallery" />
      <Spacer width={24} />
      <Dropdown mainText="Account">
        <CopyToClipboard textToCopy={walletAddress}>
          <TextButton
            text={truncatedAddress}
            disableTextTransform
            underlineOnHover
          />
        </CopyToClipboard>
        <Spacer height={12} />
        <TextButton text="Sign Out" onClick={logOut} underlineOnHover />
      </Dropdown>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
`;

export default LoggedInNav;

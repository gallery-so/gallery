import { useCallback, useMemo } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';
import { useAuthActions } from 'contexts/auth/AuthContext';
import TextButton from 'components/core/Button/TextButton';
import Dropdown from 'components/core/Dropdown/Dropdown';
import Spacer from 'components/core/Spacer/Spacer';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import {
  useAuthenticatedUser,
  useAuthenticatedUserAddress,
} from 'hooks/api/users/useUser';

function truncate(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function LoggedInNav() {
  const { logOut } = useAuthActions();
  const user = useAuthenticatedUser();
  const userAddress = useAuthenticatedUserAddress();
  const truncatedUserAddress = useMemo(() => {
    return truncate(userAddress);
  }, [userAddress]);

  const handleGalleryRedirect = useCallback(() => {
    navigate(`/${user.username}`);
  }, [user.username]);

  return (
    <Container>
      <TextButton onClick={handleGalleryRedirect} text="My Gallery" />
      <Spacer width={24} />
      <Dropdown mainText="Account">
        <CopyToClipboard textToCopy={userAddress}>
          <TextButton
            text={truncatedUserAddress}
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

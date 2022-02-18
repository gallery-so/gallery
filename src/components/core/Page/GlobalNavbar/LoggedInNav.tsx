import { useCallback, useMemo } from 'react';
import TextButton from 'components/core/Button/TextButton';
import Dropdown from 'components/core/Dropdown/Dropdown';
import Spacer from 'components/core/Spacer/Spacer';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import { useAuthenticatedUser, useAuthenticatedUserAddress } from 'hooks/api/users/useUser';
import { useModal } from 'contexts/modal/ModalContext';
import EditUserInfoModal from 'scenes/UserGalleryPage/EditUserInfoModal';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import { truncateAddress } from 'utils/wallet';
import NavElement from './NavElement';
import { useRouter } from 'next/router';

function LoggedInNav() {
  const user = useAuthenticatedUser();
  const userAddress = useAuthenticatedUserAddress();
  const { showModal } = useModal();
  const { push } = useRouter();

  const truncatedUserAddress = useMemo(() => truncateAddress(userAddress), [userAddress]);

  const username = user.username;

  const handleManageWalletsClick = useCallback(() => {
    showModal(<ManageWalletsModal />);
  }, [showModal]);

  const handleEditNameClick = useCallback(() => {
    showModal(<EditUserInfoModal />);
  }, [showModal]);

  const handleEditGalleryClick = useCallback(() => {
    void push('/edit');
  }, [push]);

  return (
    <>
      <NavElement>
        <Dropdown mainText="Edit Profile">
          <CopyToClipboard textToCopy={userAddress}>
            <TextButton text={truncatedUserAddress} disableTextTransform underlineOnHover />
          </CopyToClipboard>
          <Spacer height={12} />
          <TextButton text="Edit name & Bio" onClick={handleEditNameClick} underlineOnHover />
          <Spacer height={12} />
          <TextButton text="Edit Gallery" onClick={handleEditGalleryClick} underlineOnHover />
        </Dropdown>
      </NavElement>
      <Spacer width={24} />
      <NavElement>
        <TextButton onClick={handleManageWalletsClick} text={username} />
      </NavElement>
    </>
  );
}

export default LoggedInNav;

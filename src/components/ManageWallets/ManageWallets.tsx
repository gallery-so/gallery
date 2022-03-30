import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY } from 'constants/storageKeys';
import { useAuthenticatedUserAddresses } from 'hooks/api/users/useUser';
import useAddWalletModal from 'hooks/useAddWalletModal';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import ManageWalletsRow from './ManageWalletsRow';

type Props = {
  newAddress?: string;
};

function ManageWallets({ newAddress }: Props) {
  const addresses = useAuthenticatedUserAddresses();
  const [removedAddress, setRemovedAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState('');

  const showAddWalletModal = useAddWalletModal();

  const handleSubmit = useCallback(async () => {
    showAddWalletModal();
  }, [showAddWalletModal]);

  const addWalletDisabled = useMemo(() => addresses.length >= 5, [addresses]);
  const [userSigninAddress] = usePersistedState(USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY, '');

  useEffect(() => {
    if (removedAddress) {
      setNotification(`Wallet ${removedAddress} has been removed.`);
    }
  }, [removedAddress]);

  useEffect(() => {
    if (newAddress) {
      setNotification(`Wallet ${newAddress} has been added.`);
    }
  }, [newAddress]);

  return (
    <StyledManageWallets>
      <TitleS>Manage Accounts</TitleS>
      <Spacer height={8} />
      <BaseM color={colors.gray50}>Add more wallets to access your other NFTs.</BaseM>
      <BaseM color={colors.gray50}>
        You&apos;ll also be able to sign in using any connected wallet.
      </BaseM>
      {notification && (
        <>
          <Spacer height={16} />
          <BaseM>{notification}</BaseM>
        </>
      )}
      {errorMessage ? <StyledErrorText message={errorMessage} /> : <Spacer height={16} />}
      {addresses.map((address) => (
        <ManageWalletsRow
          key={address}
          address={address}
          setErrorMessage={setErrorMessage}
          userSigninAddress={userSigninAddress}
          setRemovedAddress={setRemovedAddress}
        />
      ))}
      <StyledButton text="+ Add new wallet" onClick={handleSubmit} disabled={addWalletDisabled} />
    </StyledManageWallets>
  );
}

const StyledManageWallets = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
  padding: 16px;
  width: 100%;
  height: 100%;
`;

const StyledErrorText = styled(ErrorText)`
  padding: 8px 0;
`;

export default ManageWallets;

import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { BodyMedium, BodyRegular } from 'components/core/Text/Text';
import { USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import useFetcher from 'contexts/swr/useFetcher';
import { useAuthenticatedUserAddresses } from 'hooks/api/users/useUser';
import useAddWalletModal from 'hooks/useAddWalletModal';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { getLocalStorageItem } from 'utils/localStorage';
import ManageWalletsRow from './ManageWalletsRow';

type Props = {
  newAddress?: string;
};

function ManageWallets({ newAddress }: Props) {
  const addresses = useAuthenticatedUserAddresses();
  const fetcher = useFetcher();

  const [localAddresses, setLocalAddresses] = useState(addresses);
  const [errorMessage, setErrorMessage] = useState('');

  const showAddWalletModal = useAddWalletModal();

  const handleSubmit = useCallback(async () => {
    showAddWalletModal();
  }, [showAddWalletModal]);

  const removeUserAddressInternally = useCallback((index: number) => {
    localAddresses.splice(index, 1);
    setLocalAddresses([...localAddresses]);
  }, [localAddresses]);

  useEffect(() => {
    setLocalAddresses([...addresses]);
  }, [addresses]);

  const userSigninAddress = useMemo(() => getLocalStorageItem<string>(USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY), []) ?? '';

  return (
    <StyledManageWallets>
      <BodyMedium>Manage Wallets</BodyMedium>
      <Spacer height={4} />
      <BodyRegular color={colors.gray50}>
        Add more wallets to access your other NFTs. You'll also be able to sign in using any connected wallet.
      </BodyRegular>
      {newAddress && <>
        <Spacer height={16} />
        <BodyRegular>
          Wallet {newAddress} was added.
        </BodyRegular>
      </>}
      {errorMessage ? <StyledErrorText message={errorMessage} /> : <Spacer height={16} />}
      {localAddresses.map((address, i) => <ManageWalletsRow
        key={address}
        index={i}
        address={address}
        fetcher={fetcher}
        onDisconnect={removeUserAddressInternally}
        setErrorMessage={setErrorMessage}
        userSigninAddress={userSigninAddress}
      />)}
      <StyledButton
        text="+ Add new wallet"
        onClick={handleSubmit}
      />
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

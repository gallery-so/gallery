import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { BodyMedium, BodyRegular } from 'components/core/Text/Text';
import { USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import { useAuthenticatedUserAddresses } from 'hooks/api/users/useUser';
import useAddWalletModal from 'hooks/useAddWalletModal';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import ManageWalletsRow from './ManageWalletsRow';

type Props = {
  newAddress?: string;
};

function ManageWallets({ newAddress }: Props) {
  const addresses = useAuthenticatedUserAddresses();
  const [errorMessage, setErrorMessage] = useState('');

  const showAddWalletModal = useAddWalletModal();

  const handleSubmit = useCallback(async () => {
    showAddWalletModal();
  }, [showAddWalletModal]);

  const addWalletDisabled = useMemo(() => addresses.length >= 5, [addresses]);
  const [userSigninAddress] = usePersistedState(
    USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY,
    ''
  );

  return (
    <StyledManageWallets>
      <BodyMedium>Manage Wallets</BodyMedium>
      <Spacer height={4} />
      <BodyRegular color={colors.gray50}>
        Add more wallets to access your other NFTs. You&apos;ll also be able to
        sign in using any connected wallet.
      </BodyRegular>
      {newAddress && (
        <>
          <Spacer height={16} />
          <BodyRegular>Wallet {newAddress} was added.</BodyRegular>
        </>
      )}
      {errorMessage ? (
        <StyledErrorText message={errorMessage} />
      ) : (
        <Spacer height={16} />
      )}
      {addresses.map((address) => (
        <ManageWalletsRow
          key={address}
          address={address}
          setErrorMessage={setErrorMessage}
          userSigninAddress={userSigninAddress}
        />
      ))}
      <StyledButton
        text="+ Add new wallet"
        onClick={handleSubmit}
        disabled={addWalletDisabled}
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

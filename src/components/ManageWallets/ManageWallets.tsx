import { Button } from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { BaseM } from 'components/core/Text/Text';
import { USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY } from 'constants/storageKeys';
import useAddWalletModal from 'hooks/useAddWalletModal';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { ManageWalletsFragment$key } from '__generated__/ManageWalletsFragment.graphql';
import ManageWalletsRow from './ManageWalletsRow';

type Props = {
  newAddress?: string;
  queryRef: ManageWalletsFragment$key;
};

const MAX_ALLOWED_ADDRESSES = 10;

function ManageWallets({ newAddress, queryRef }: Props) {
  const { viewer } = useFragment(
    graphql`
      fragment ManageWalletsFragment on Query {
        viewer {
          ... on Viewer {
            user {
              wallets {
                dbid @required(action: THROW)
                chainAddress @required(action: THROW) {
                  address @required(action: THROW)
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const wallets = useMemo(() => removeNullValues(viewer?.user?.wallets), [viewer?.user?.wallets]);

  const [removedAddress, setRemovedAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState('');

  const showAddWalletModal = useAddWalletModal();

  const handleSubmit = useCallback(async () => {
    showAddWalletModal();
  }, [showAddWalletModal]);

  const addWalletDisabled = useMemo(() => wallets.length >= MAX_ALLOWED_ADDRESSES, [wallets]);
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
      <Spacer height={16} />
      <BaseM>Add more wallets to access your other NFTs.</BaseM>
      <BaseM>You&apos;ll also be able to sign in using any connected wallet.</BaseM>
      {notification && (
        <>
          <Spacer height={16} />
          <BaseM>{notification}</BaseM>
        </>
      )}
      {errorMessage ? <StyledErrorText message={errorMessage} /> : <Spacer height={16} />}
      {wallets.map((wallet) => (
        <ManageWalletsRow
          key={wallet.dbid}
          walletId={wallet.dbid}
          address={wallet.chainAddress.address}
          setErrorMessage={setErrorMessage}
          userSigninAddress={userSigninAddress}
          setRemovedAddress={setRemovedAddress}
          isOnlyWalletConnected={wallets.length === 1}
        />
      ))}
      <Spacer height={16} />
      <StyledButton onClick={handleSubmit} disabled={addWalletDisabled}>
        Add new wallet
      </StyledButton>
    </StyledManageWallets>
  );
}

const StyledManageWallets = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
  width: 100%;
`;

const StyledErrorText = styled(ErrorText)`
  padding: 8px 0;
`;

export default ManageWallets;

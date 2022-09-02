import { Button } from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { BaseM } from 'components/core/Text/Text';
import { USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY } from 'constants/storageKeys';
import { useToastActions } from 'contexts/toast/ToastContext';
import useAddWalletModal from 'hooks/useAddWalletModal';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { truncateAddress } from 'utils/wallet';
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
                  chain @required(action: THROW)
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

  const { pushToast } = useToastActions();

  const [removedAddress, setRemovedAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showAddWalletModal = useAddWalletModal();

  const handleSubmit = useCallback(async () => {
    showAddWalletModal();
  }, [showAddWalletModal]);

  const addWalletDisabled = useMemo(() => wallets.length >= MAX_ALLOWED_ADDRESSES, [wallets]);
  const [userSigninAddress] = usePersistedState(USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY, '');

  useEffect(() => {
    if (removedAddress) {
      pushToast({
        message: `You have removed all pieces in wallet ${truncateAddress(
          removedAddress
        )} from your gallery.`,
        autoClose: true,
      });
    }
  }, [removedAddress, pushToast]);

  useEffect(() => {
    if (newAddress) {
      pushToast({
        message: `Wallet ${truncateAddress(newAddress)} has been added.`,
        autoClose: true,
      });
    }
  }, [newAddress, pushToast]);

  return (
    <StyledManageWallets>
      <Spacer height={16} />
      <BaseM>Add more wallets to access your other NFTs.</BaseM>
      <BaseM>You&apos;ll also be able to sign in using any connected wallet.</BaseM>
      {errorMessage ? <StyledErrorText message={errorMessage} /> : <Spacer height={16} />}
      {wallets.map((wallet) => (
        <ManageWalletsRow
          key={wallet.dbid}
          walletId={wallet.dbid}
          address={wallet.chainAddress.address}
          chain={wallet.chainAddress.chain}
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

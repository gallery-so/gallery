import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import ErrorText from '~/components/core/Text/ErrorText';
import { USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY } from '~/constants/storageKeys';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { ManageWalletsFragment$key } from '~/generated/ManageWalletsFragment.graphql';
import useAddWalletModal from '~/hooks/useAddWalletModal';
import usePersistedState from '~/hooks/usePersistedState';
import SettingsRowDescription from '~/scenes/Modals/SettingsModal/SettingsRowDescription';
import { removeNullValues } from '~/utils/removeNullValues';
import { graphqlTruncateAddress, truncateAddress } from '~/utils/wallet';

import ManageWalletsRow from './ManageWalletsRow';
import PrimaryWalletRow from './PrimaryWalletRow';

type Props = {
  newAddress?: string;
  queryRef: ManageWalletsFragment$key;
  onEthAddWalletSuccess?: () => void;
  onTezosAddWalletSuccess?: () => void;
};

const MAX_ALLOWED_ADDRESSES = 15;

function ManageWallets({
  newAddress,
  queryRef,
  onEthAddWalletSuccess,
  onTezosAddWalletSuccess,
}: Props) {
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
                  ...ManageWalletsRow
                }
              }
              primaryWallet @required(action: THROW) {
                dbid @required(action: THROW)
                chainAddress @required(action: THROW) {
                  chain @required(action: THROW)
                  ...walletTruncateAddressFragment
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const primaryWallet = viewer?.user?.primaryWallet;
  const nonPrimaryWallets = useMemo(
    () =>
      removeNullValues(viewer?.user?.wallets).filter(
        (wallet) => wallet.dbid !== primaryWallet?.dbid
      ),
    [primaryWallet?.dbid, viewer?.user?.wallets]
  );

  const { pushToast } = useToastActions();

  const [removedAddress, setRemovedAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showAddWalletModal = useAddWalletModal();

  const handleSubmit = useCallback(async () => {
    showAddWalletModal({ onEthAddWalletSuccess, onTezosAddWalletSuccess });
  }, [onEthAddWalletSuccess, onTezosAddWalletSuccess, showAddWalletModal]);

  const addWalletDisabled = useMemo(
    () => nonPrimaryWallets.length >= MAX_ALLOWED_ADDRESSES,
    [nonPrimaryWallets]
  );
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
    <VStack gap={16}>
      <VStack gap={16}>
        <VStack>
          <SettingsRowDescription>
            Add wallets to access your pieces. You&apos;ll be able to sign in using any connected
            wallet.
          </SettingsRowDescription>
          {errorMessage && <StyledErrorText message={errorMessage} />}
        </VStack>

        {primaryWallet && (
          <PrimaryWalletRow
            address={graphqlTruncateAddress(primaryWallet.chainAddress)}
            chain={primaryWallet.chainAddress.chain}
          />
        )}
        <VStack>
          {nonPrimaryWallets.map((wallet) => (
            <ManageWalletsRow
              key={wallet.dbid}
              walletId={wallet.dbid}
              address={wallet.chainAddress.address}
              chain={wallet.chainAddress.chain}
              setErrorMessage={setErrorMessage}
              userSigninAddress={userSigninAddress}
              setRemovedAddress={setRemovedAddress}
              isOnlyWalletConnected={nonPrimaryWallets.length === 1}
              chainAddressRef={wallet.chainAddress}
            />
          ))}
        </VStack>
      </VStack>
      <StyledButton onClick={handleSubmit} disabled={addWalletDisabled} variant="secondary">
        Add new wallet
      </StyledButton>
    </VStack>
  );
}

const StyledButton = styled(Button)`
  align-self: flex-start;
`;

const StyledErrorText = styled(ErrorText)`
  padding: 8px 0;
`;

export default ManageWallets;

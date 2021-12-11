import { Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import colors from 'components/core/colors';
import { BodyRegular, TitleMedium } from 'components/core/Text/Text';
import useFetcher from 'contexts/swr/useFetcher';
import { useAuthenticatedUserAddresses } from 'hooks/api/users/useUser';
import { useCallback, useEffect, useState } from 'react';
import GnosisSafePendingMessage from '../GnosisSafePendingMessage';

import { isWeb3Error, Web3Error } from 'types/Error';
import Spacer from 'components/core/Spacer/Spacer';
import {
  ADDRESS_ALREADY_CONNECTED,
  INITIAL,
  PROMPT_SIGNATURE,
  PendingState,
  LISTENING_ONCHAIN,
} from 'types/Wallet';
import { useModal } from 'contexts/modal/ModalContext';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import Mixpanel from 'utils/mixpanel';
import { addWallet, fetchNonce } from '../authRequestUtils';
import {
  GNOSIS_SAFE_WALLET_TYPE_ID,
  listenForGnosisSignature,
  signMessageWithContractAccount,
} from '../walletUtils';

type Props = {
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
function AddWalletPendingGnosisSafe({
  pendingWallet,
  userFriendlyWalletName,
  setDetectedError,
}: Props) {
  const { library, account } = useWeb3React<Web3Provider>();
  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);

  const fetcher = useFetcher();
  const authenticatedUserAddresses = useAuthenticatedUserAddresses();

  const { showModal } = useModal();

  const openManageWalletsModal = useCallback(
    (address: string) => {
      showModal(<ManageWalletsModal newAddress={address} />);
    },
    [showModal]
  );

  const attemptAddWallet = useCallback(
    async (address: string) => {
      try {
        setPendingState(PROMPT_SIGNATURE);
        const { nonce, user_exists: userExists } = await fetchNonce(address, fetcher);
        if (userExists) {
          throw { code: 'EXISTING_USER' } as Web3Error;
        }

        const signature = await signMessageWithContractAccount(
          address,
          nonce,
          pendingWallet,
          library
        );

        setPendingState(LISTENING_ONCHAIN);

        await listenForGnosisSignature(address, nonce, library);

        const payload = {
          address,
          nonce,
          wallet_type: GNOSIS_SAFE_WALLET_TYPE_ID,
        };

        const { signatureValid } = await addWallet(payload, fetcher);

        Mixpanel.trackConnectWallet(userFriendlyWalletName, 'Add Wallet');
        openManageWalletsModal(address);

        return signatureValid;
      } catch (error: unknown) {
        if (isWeb3Error(error)) {
          setDetectedError(error);
        }

        // Fall back to generic error message
        if (error instanceof Error) {
          const web3Error: Web3Error = { code: 'AUTHENTICATION_ERROR', ...error };
          setDetectedError(web3Error);
        }
      }
    },
    [
      fetcher,
      openManageWalletsModal,
      pendingWallet,
      userFriendlyWalletName,
      setDetectedError,
      library,
    ]
  );

  useEffect(() => {
    async function authenticate() {
      if (account) {
        if (authenticatedUserAddresses.includes(account.toLowerCase())) {
          setPendingState(ADDRESS_ALREADY_CONNECTED);
          return;
        }

        await attemptAddWallet(account.toLowerCase());
      }
    }

    void authenticate();
  }, [account, authenticatedUserAddresses, attemptAddWallet]);

  if (pendingState === ADDRESS_ALREADY_CONNECTED && account) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={8} />
        <BodyRegular color={colors.gray50}>
          The following address is already connected to this account:
        </BodyRegular>
        <Spacer height={8} />
        <BodyRegular color={colors.black}>{account.toLowerCase()}</BodyRegular>
      </div>
    );
  }

  return (
    <GnosisSafePendingMessage
      pendingState={pendingState}
      userFriendlyWalletName={userFriendlyWalletName}
    />
  );
}

export default AddWalletPendingGnosisSafe;

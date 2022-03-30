import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import { BaseM, TitleMedium } from 'components/core/Text/Text';
import useFetcher from 'contexts/swr/useFetcher';
import { useAuthenticatedUserAddresses } from 'hooks/api/users/useUser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { isWeb3Error, Web3Error } from 'types/Error';
import Spacer from 'components/core/Spacer/Spacer';
import {
  ADDRESS_ALREADY_CONNECTED,
  CONFIRM_ADDRESS,
  INITIAL,
  METAMASK,
  PendingState,
  PROMPT_SIGNATURE,
  WalletName,
} from 'types/Wallet';
import { useModal } from 'contexts/modal/ModalContext';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import { addWallet, useCreateNonceMutation } from '../authRequestUtils';
import { DEFAULT_WALLET_TYPE_ID, signMessageWithEOA } from '../walletUtils';
import {
  useTrackAddWalletAttempt,
  useTrackAddWalletError,
  useTrackAddWalletSuccess,
} from 'contexts/analytics/authUtil';
import { captureException } from '@sentry/nextjs';

type Props = {
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
  walletName: WalletName;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
function AddWalletPendingDefault({
  pendingWallet,
  userFriendlyWalletName,
  setDetectedError,
  walletName,
}: Props) {
  const { library, account } = useWeb3React<Web3Provider>();
  const signer = useMemo(
    () => (library && account ? library.getSigner(account) : undefined),
    [library, account]
  );

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetcher = useFetcher();
  const authenticatedUserAddresses = useAuthenticatedUserAddresses();

  const { showModal } = useModal();

  const openManageWalletsModal = useCallback(
    (address: string) => {
      showModal(<ManageWalletsModal newAddress={address} />);
    },
    [showModal]
  );

  const createNonce = useCreateNonceMutation();
  const trackAddWalletAttempt = useTrackAddWalletAttempt();
  const trackAddWalletSuccess = useTrackAddWalletSuccess();
  const trackAddWalletError = useTrackAddWalletError();

  /**
   * Add Wallet Pipeline:
   * 1. Fetch nonce from server with provided wallet address
   * 2. Sign nonce with wallet (metamask / walletconnect / etc.)
   * 3. Add wallet address to user's account
   */
  const attemptAddWallet = useCallback(
    async (address: string, signer: JsonRpcSigner) => {
      try {
        setIsConnecting(true);
        setPendingState(PROMPT_SIGNATURE);

        trackAddWalletAttempt(userFriendlyWalletName);
        const { nonce, user_exists: userExists } = await createNonce(address);

        if (userExists) {
          throw { code: 'EXISTING_USER' } as Web3Error;
        }

        const signature = await signMessageWithEOA(address, nonce, signer, pendingWallet);
        const payload = {
          signature,
          address,
          wallet_type: DEFAULT_WALLET_TYPE_ID,
        };
        const { signatureValid } = await addWallet(payload, fetcher);

        trackAddWalletSuccess(userFriendlyWalletName);
        openManageWalletsModal(address);
        setIsConnecting(false);

        return signatureValid;
      } catch (error: unknown) {
        setIsConnecting(false);
        trackAddWalletError(userFriendlyWalletName, error);
        if (isWeb3Error(error)) {
          captureException(error.message);
          setDetectedError(error);
        }

        // Fall back to generic error message
        if (error instanceof Error) {
          captureException(error);
          const web3Error: Web3Error = { code: 'AUTHENTICATION_ERROR', ...error };
          setDetectedError(web3Error);
        }
      }
    },
    [
      trackAddWalletAttempt,
      userFriendlyWalletName,
      createNonce,
      pendingWallet,
      fetcher,
      trackAddWalletSuccess,
      openManageWalletsModal,
      trackAddWalletError,
      setDetectedError,
    ]
  );

  const isMetamask = useMemo(() => walletName === METAMASK, [walletName]);

  useEffect(() => {
    async function authenticate() {
      if (account && signer) {
        if (authenticatedUserAddresses.includes(account.toLowerCase())) {
          setPendingState(ADDRESS_ALREADY_CONNECTED);
          return;
        }

        if (isMetamask) {
          // For metamask, prompt the user to confirm the address provided by the extension is the one they want to connect with
          setPendingState(CONFIRM_ADDRESS);
        } else {
          await attemptAddWallet(account.toLowerCase(), signer);
        }
      }
    }

    void authenticate();
  }, [account, signer, authenticatedUserAddresses, attemptAddWallet, isMetamask]);

  if (pendingState === ADDRESS_ALREADY_CONNECTED && account) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={8} />
        <BaseM color={colors.gray50}>
          The following address is already connected to this account:
        </BaseM>
        <Spacer height={8} />
        <BaseM color={colors.black}>{account.toLowerCase()}</BaseM>
        {isMetamask && (
          <>
            <Spacer height={8} />
            <BaseM color={colors.gray50}>
              If you want to connect a different address via Metamask, please switch accounts in the
              extension and try again.
            </BaseM>
          </>
        )}
      </div>
    );
  }

  // right now we only show this case for Metamask
  if (pendingState === CONFIRM_ADDRESS && account && signer) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={8} />
        <BaseM color={colors.gray50}>Confirm the following wallet address:</BaseM>
        <Spacer height={8} />
        <BaseM color={colors.black}>{account?.toLowerCase()}</BaseM>
        <Spacer height={16} />
        <BaseM color={colors.gray50}>
          If you want to connect a different address via Metamask, please switch accounts in the
          extension and try again.
        </BaseM>
        <Spacer height={24} />
        <StyledButton
          text={isConnecting ? 'Connecting...' : 'Confirm'}
          onClick={async () => attemptAddWallet(account.toLowerCase(), signer)}
          disabled={isConnecting}
        />
      </div>
    );
  }

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={8} />
        <BaseM color={colors.gray50}>Sign the message with your wallet.</BaseM>
      </div>
    );
  }

  // Default view for when pendingState === INITIAL
  return (
    <div>
      <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
      <Spacer height={8} />
      <BaseM color={colors.gray50}>Approve your wallet to connect to Gallery.</BaseM>
    </div>
  );
}

const StyledButton = styled(Button)`
  align-self: flex-end;
  padding: 16px;
  width: 100%;
  height: 100%;
`;

export default AddWalletPendingDefault;

import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import { Button } from 'components/core/Button/Button';
import colors from 'components/core/colors';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { isWeb3Error, Web3Error } from 'types/Error';
import {
  ADDRESS_ALREADY_CONNECTED,
  CONFIRM_ADDRESS,
  INITIAL,
  METAMASK,
  PendingState,
  PROMPT_SIGNATURE,
  WalletName,
} from 'types/Wallet';
import { useModalActions } from 'contexts/modal/ModalContext';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import { signMessageWithEOA } from '../walletUtils';
import {
  isNotEarlyAccessError,
  useTrackAddWalletAttempt,
  useTrackAddWalletError,
  useTrackAddWalletSuccess,
} from 'contexts/analytics/authUtil';
import { captureException } from '@sentry/nextjs';
import { AddWalletPendingDefaultFragment$key } from '__generated__/AddWalletPendingDefaultFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import useCreateNonce from '../mutations/useCreateNonce';
import useAddWallet from '../mutations/useAddWallet';
import { VStack } from 'components/core/Spacer/Stack';
import WalletOnboardingMessage from '../multichain/WalletOnboardingMessage';

type Props = {
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
  walletName: WalletName;
  queryRef: AddWalletPendingDefaultFragment$key;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
function AddWalletPendingDefault({
  pendingWallet,
  userFriendlyWalletName,
  setDetectedError,
  walletName,
  queryRef,
}: Props) {
  const { library, account } = useWeb3React<Web3Provider>();
  const signer = useMemo(() => (library && account ? library.getSigner(account) : undefined), [
    library,
    account,
  ]);

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);
  const [isConnecting, setIsConnecting] = useState(false);

  const query = useFragment(
    graphql`
      fragment AddWalletPendingDefaultFragment on Query {
        viewer {
          ... on Viewer {
            user {
              wallets {
                chainAddress @required(action: NONE) {
                  address
                }
              }
            }
          }
        }

        ...ManageWalletsModalFragment
      }
    `,
    queryRef
  );

  const { viewer } = query;

  const authenticatedUserAddresses = useMemo(
    () => removeNullValues(viewer?.user?.wallets?.map((wallet) => wallet?.chainAddress.address)),
    [viewer?.user?.wallets]
  );

  const { showModal } = useModalActions();

  const openManageWalletsModal = useCallback(
    (address: string) => {
      showModal({
        content: <ManageWalletsModal queryRef={query} newAddress={address} />,
        headerText: 'Connect your wallet',
      });
    },
    [showModal, query]
  );

  const createNonce = useCreateNonce();
  const trackAddWalletAttempt = useTrackAddWalletAttempt();
  const trackAddWalletSuccess = useTrackAddWalletSuccess();
  const trackAddWalletError = useTrackAddWalletError();

  /**
   * Add Wallet Pipeline:
   * 1. Fetch nonce from server with provided wallet address
   * 2. Sign nonce with wallet (metamask / walletconnect / etc.)
   * 3. Add wallet address to user's account
   */
  const addWallet = useAddWallet();
  const attemptAddWallet = useCallback(
    async (address: string, signer: JsonRpcSigner) => {
      try {
        setIsConnecting(true);
        setPendingState(PROMPT_SIGNATURE);

        trackAddWalletAttempt(userFriendlyWalletName);
        const { nonce, user_exists: userExists } = await createNonce(address, 'Ethereum');

        if (userExists) {
          throw { code: 'EXISTING_USER' } as Web3Error;
        }

        const signature = await signMessageWithEOA(address, nonce, signer, pendingWallet);
        const { signatureValid } = await addWallet({
          authMechanism: {
            eoa: {
              signature,
              nonce,
              chainPubKey: {
                pubKey: address,
                chain: 'Ethereum',
              },
            },
          },
          chainAddress: {
            address,
            chain: 'Ethereum',
          },
        });

        trackAddWalletSuccess(userFriendlyWalletName);
        openManageWalletsModal(address);
        setIsConnecting(false);

        return signatureValid;
      } catch (error: unknown) {
        setIsConnecting(false);
        trackAddWalletError(userFriendlyWalletName, error);
        if (isWeb3Error(error)) {
          if (!isNotEarlyAccessError(error.message)) {
            captureException(error.message);
          }
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
      addWallet,
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
      <VStack gap={8}>
        <TitleS>Connect with {userFriendlyWalletName}</TitleS>
        <BaseM>The following address is already connected to this account:</BaseM>
        <BaseM color={colors.offBlack}>{account.toLowerCase()}</BaseM>
        {isMetamask && (
          <BaseM>
            If you want to connect a different address via Metamask, please switch accounts in the
            extension and try again.
          </BaseM>
        )}
      </VStack>
    );
  }

  // right now we only show this case for Metamask
  if (pendingState === CONFIRM_ADDRESS && account && signer) {
    return (
      <VStack gap={24}>
        <VStack gap={16}>
          <VStack gap={8}>
            <TitleS>Connect with {userFriendlyWalletName}</TitleS>
            <BaseM>Confirm the following wallet address:</BaseM>
            <BaseM color={colors.offBlack}>{account?.toLowerCase()}</BaseM>
          </VStack>
          <BaseM>
            If you want to connect a different address via Metamask, please switch accounts in the
            extension and try again.
          </BaseM>
        </VStack>
        <StyledButton
          onClick={() => attemptAddWallet(account.toLowerCase(), signer)}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Confirm'}
        </StyledButton>
      </VStack>
    );
  }

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <WalletOnboardingMessage
        title={`Connect with ${userFriendlyWalletName}`}
        description="Sign the message with your wallet."
      />
    );
  }

  // Default view for when pendingState === INITIAL
  return (
    <WalletOnboardingMessage
      title={`Connect with ${userFriendlyWalletName}`}
      description="Approve your wallet to connect to Gallery."
    />
  );
}

const StyledButton = styled(Button)`
  align-self: flex-end;
  padding: 16px;
  width: 100%;
  height: 100%;
`;

export default AddWalletPendingDefault;

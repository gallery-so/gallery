import { Button } from 'components/core/Button/Button';
import colors from 'components/core/colors';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Web3Error } from 'types/Error';
import {
  ADDRESS_ALREADY_CONNECTED,
  CONFIRM_ADDRESS,
  INITIAL,
  PendingState,
  PROMPT_SIGNATURE,
} from 'types/Wallet';
import { useModalActions } from 'contexts/modal/ModalContext';
import {
  isEarlyAccessError,
  useTrackAddWalletAttempt,
  useTrackAddWalletError,
  useTrackAddWalletSuccess,
} from 'contexts/analytics/authUtil';
import { captureException } from '@sentry/nextjs';
import { EthereumAddWalletFragment$key } from '__generated__/EthereumAddWalletFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import useCreateNonce from '../mutations/useCreateNonce';
import useAddWallet from '../mutations/useAddWallet';
import { useAccount } from 'wagmi';
import { signMessage } from '@wagmi/core';
import { WalletError } from './WalletError';
import { normalizeError } from './normalizeError';
import { VStack } from 'components/core/Spacer/Stack';

type Props = {
  queryRef: EthereumAddWalletFragment$key;
  reset: () => void;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
export const EthereumAddWallet = ({ queryRef, reset }: Props) => {
  const { address, connector } = useAccount();
  const account = address?.toLowerCase();
  const isMetamask = connector?.id === 'metaMask';

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error>();

  const query = useFragment(
    graphql`
      fragment EthereumAddWalletFragment on Query {
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

  const { hideModal } = useModalActions();

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
    async (address: string) => {
      try {
        setIsConnecting(true);
        setPendingState(PROMPT_SIGNATURE);

        trackAddWalletAttempt('Ethereum');
        const { nonce, user_exists: userExists } = await createNonce(address, 'Ethereum');

        if (userExists) {
          throw { code: 'EXISTING_USER' } as Web3Error;
        }

        const signature = await signMessage({ message: nonce });
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

        trackAddWalletSuccess('Ethereum');
        hideModal();
        setIsConnecting(false);

        return signatureValid;
      } catch (error: unknown) {
        setIsConnecting(false);
        trackAddWalletError('Ethereum', error);
        // ignore early access errors
        if (!isEarlyAccessError(error)) {
          // capture all others
          captureException(error);
        }

        // Fall back to generic error message
        if (error instanceof Error) {
          const web3Error: Web3Error = { code: 'AUTHENTICATION_ERROR', ...error };
          setError(web3Error);
        } else {
          setError(normalizeError(error));
        }
      }
    },
    [
      trackAddWalletAttempt,
      createNonce,
      addWallet,
      hideModal,
      trackAddWalletSuccess,
      trackAddWalletError,
    ]
  );

  useEffect(() => {
    async function authenticate() {
      if (account) {
        if (authenticatedUserAddresses.includes(account)) {
          setPendingState(ADDRESS_ALREADY_CONNECTED);
          return;
        }

        if (isMetamask) {
          // For metamask, prompt the user to confirm the address provided by the extension is the one they want to connect with
          setPendingState(CONFIRM_ADDRESS);
        } else {
          await attemptAddWallet(account);
        }
      }
    }

    void authenticate();
  }, [account, authenticatedUserAddresses, attemptAddWallet, isMetamask]);

  if (error) {
    return (
      <WalletError
        address={account}
        error={error}
        reset={() => {
          setError(undefined);
          reset();
        }}
      />
    );
  }

  if (pendingState === ADDRESS_ALREADY_CONNECTED && account) {
    return (
      <VStack gap={8}>
        <TitleS>Connect with Ethereum</TitleS>
        <BaseM>The following address is already connected to this account:</BaseM>
        <BaseM color={colors.offBlack}>{account}</BaseM>
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
  if (pendingState === CONFIRM_ADDRESS && account) {
    return (
      <VStack gap={24}>
        <VStack gap={16}>
          <VStack gap={8}>
            <TitleS>Connect with Ethereum</TitleS>
            <BaseM>Confirm the following wallet address:</BaseM>
            <BaseM color={colors.offBlack}>{account}</BaseM>
          </VStack>
          <BaseM>
            If you want to connect a different address via Metamask, please switch accounts in the
            extension and try again.
          </BaseM>
        </VStack>
        <StyledButton onClick={() => attemptAddWallet(account)} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Confirm'}
        </StyledButton>
      </VStack>
    );
  }

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <VStack gap={8}>
        <TitleS>Connect with Ethereum</TitleS>
        <BaseM>Sign the message with your wallet.</BaseM>
      </VStack>
    );
  }

  // Default view for when pendingState === INITIAL
  return (
    <VStack gap={8}>
      <TitleS>Connect with Ethereum</TitleS>
      <BaseM>Approve your wallet to connect to Gallery.</BaseM>
    </VStack>
  );
};

const StyledButton = styled(Button)`
  align-self: flex-end;
  padding: 16px;
  width: 100%;
  height: 100%;
`;

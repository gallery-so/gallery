import { captureException } from '@sentry/nextjs';
import { signMessage } from '@wagmi/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

import { Button } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import {
  isEarlyAccessError,
  useTrackAddWalletAttempt,
  useTrackAddWalletError,
  useTrackAddWalletSuccess,
} from '~/contexts/analytics/authUtil';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { EthereumAddWalletFragment$key } from '~/generated/EthereumAddWalletFragment.graphql';
import useAddWallet from '~/shared/hooks/useAddWallet';
import useCreateNonce from '~/shared/hooks/useCreateNonce';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { Web3Error } from '~/types/Error';
import {
  ADDRESS_ALREADY_CONNECTED,
  CONFIRM_ADDRESS,
  INITIAL,
  PendingState,
  PROMPT_SIGNATURE,
} from '~/types/Wallet';
import noop from '~/utils/noop';

import { normalizeError } from './normalizeError';
import { WalletError } from './WalletError';

type Props = {
  queryRef: EthereumAddWalletFragment$key;
  reset: () => void;
  onSuccess?: () => void;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
export const EthereumAddWallet = ({ queryRef, reset, onSuccess = noop }: Props) => {
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
        onSuccess();
        setIsConnecting(false);

        return signatureValid;
      } catch (error) {
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
      onSuccess,
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
      <EmptyState title="Connect with Ethereum or L2 Wallet">
        <VStack gap={8}>
          <VStack>
            <BaseM>The following address is already connected to this account:</BaseM>
            <BaseM color={colors.black['800']}>{account}</BaseM>
          </VStack>
          {isMetamask && (
            <BaseM>
              If you want to connect a different address via Metamask, please switch accounts in the
              extension and try again.
            </BaseM>
          )}
        </VStack>
      </EmptyState>
    );
  }

  // right now we only show this case for Metamask
  if (pendingState === CONFIRM_ADDRESS && account) {
    return (
      <EmptyState title="Connect with Ethereum or L2 Wallet">
        <VStack gap={24}>
          <VStack gap={16}>
            <VStack>
              <BaseM>Confirm the following wallet address:</BaseM>
              <BaseM color={colors.black['800']}>{account}</BaseM>
            </VStack>
            <BaseM>
              If you want to connect a different address via Metamask, please switch accounts in the
              extension and try again.
            </BaseM>
          </VStack>
          <StyledButton
            // event is tracked in handler above
            eventElementId={null}
            eventName={null}
            eventContext={null}
            onClick={() => attemptAddWallet(account)}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Confirm'}
          </StyledButton>
        </VStack>
      </EmptyState>
    );
  }

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <EmptyState
        title="Connect with Ethereum or L2 Wallet"
        description="Sign the message with your wallet."
      />
    );
  }

  // Default view for when pendingState === INITIAL
  return (
    <EmptyState
      title="Connect with Ethereum or L2 Wallet"
      description="Approve your wallet to connect to Gallery."
    />
  );
};

const StyledButton = styled(Button)`
  align-self: center;
`;

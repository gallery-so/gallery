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
import { TezosAddWalletFragment$key } from '__generated__/TezosAddWalletFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import useAddWallet from 'components/WalletSelector/mutations/useAddWallet';
import useCreateNonce from 'components/WalletSelector/mutations/useCreateNonce';
import { normalizeError } from '../normalizeError';
import { WalletError } from '../WalletError';
import { generatePayload, getNonceNumber } from './tezosUtils';
import { useBeaconActions } from 'contexts/beacon/BeaconContext';
import WalletOnboardingMessage from '../WalletOnboardingMessage';
import { VStack } from 'components/core/Spacer/Stack';
import noop from 'utils/noop';

type Props = {
  queryRef: TezosAddWalletFragment$key;
  reset: () => void;
  onSuccess?: () => void;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
export const TezosAddWallet = ({ queryRef, reset, onSuccess = noop }: Props) => {
  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error>();
  const [account, setAccount] = useState<string>();
  const [publicKey, setPublicKey] = useState<string>();
  const [wallet, setWallet] = useState<string>();
  const { getActiveAccount, requestSignature } = useBeaconActions();

  const messageHeaderText = `Connect with ${wallet || 'Tezos'} wallet`;

  const query = useFragment(
    graphql`
      fragment TezosAddWalletFragment on Query {
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
   * 2. Sign nonce with wallet (beacon)
   * 3. Add wallet address to user's account
   */
  const addWallet = useAddWallet();
  const attemptAddWallet = useCallback(
    async (address: string, publicKey: string) => {
      try {
        setIsConnecting(true);

        trackAddWalletAttempt('Tezos');
        const { nonce, user_exists: userExists } = await createNonce(address, 'Tezos');

        if (userExists) {
          throw { code: 'EXISTING_USER' } as Web3Error;
        }

        const payload = generatePayload(nonce, address);
        setPendingState(PROMPT_SIGNATURE);
        const signature = await requestSignature(payload);

        const nonceNumber = getNonceNumber(nonce);

        const { signatureValid } = await addWallet({
          authMechanism: {
            eoa: {
              signature,
              nonce: nonceNumber,
              chainPubKey: {
                pubKey: publicKey,
                chain: 'Tezos',
              },
            },
          },
          chainAddress: {
            address,
            chain: 'Tezos',
          },
        });

        trackAddWalletSuccess('Tezos');
        hideModal();
        onSuccess();
        setIsConnecting(false);

        return signatureValid;
      } catch (error) {
        setIsConnecting(false);
        trackAddWalletError('Tezos', error);
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
      requestSignature,
      addWallet,
      trackAddWalletSuccess,
      hideModal,
      onSuccess,
      trackAddWalletError,
    ]
  );

  useEffect(() => {
    async function authenticate() {
      if (account && authenticatedUserAddresses.includes(account)) {
        setPendingState(ADDRESS_ALREADY_CONNECTED);
        return;
      }

      try {
        const { publicKey, address, wallet } = await getActiveAccount();
        if (!address || !publicKey) return;

        setPendingState(CONFIRM_ADDRESS);
        setAccount(address);
        setPublicKey(publicKey);
        setWallet(wallet);

        await attemptAddWallet(address, publicKey);
      } catch (error) {
        setError(normalizeError(error));
      }
    }

    if (pendingState === INITIAL) {
      void authenticate();
    }
  }, [account, attemptAddWallet, authenticatedUserAddresses, getActiveAccount, pendingState]);

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
        <TitleS>Connect with Tezos</TitleS>
        <BaseM>The following address is already connected to this account:</BaseM>
        <BaseM color={colors.offBlack}>{account}</BaseM>
      </VStack>
    );
  }

  // right now we only show this case for Metamask
  if (pendingState === CONFIRM_ADDRESS && account && publicKey) {
    return (
      <VStack gap={24}>
        <VStack gap={16}>
          <VStack gap={8}>
            <TitleS>Connect with Tezos</TitleS>
            <BaseM>Confirm the following wallet address:</BaseM>
            <BaseM color={colors.offBlack}>{account}</BaseM>
          </VStack>
          <BaseM>
            If you want to connect a different address via Tezos wallet, please switch accounts in
            the extension and try again.
          </BaseM>
        </VStack>
        <StyledButton onClick={() => attemptAddWallet(account, publicKey)} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Confirm'}
        </StyledButton>
      </VStack>
    );
  }

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <WalletOnboardingMessage
        title={messageHeaderText}
        description="Sign the message with your wallet."
      />
    );
  }

  // Default view for when pendingState === INITIAL
  return (
    <WalletOnboardingMessage
      title={messageHeaderText}
      description="Approve your wallet to connect to Gallery."
    />
  );
};

const StyledButton = styled(Button)`
  align-self: flex-end;
  padding: 16px;
  width: 100%;
  height: 100%;
`;

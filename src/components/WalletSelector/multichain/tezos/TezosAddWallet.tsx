import { Button } from 'components/core/Button/Button';
import colors from 'components/core/colors';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Web3Error } from 'types/Error';
import Spacer from 'components/core/Spacer/Spacer';
import {
  ADDRESS_ALREADY_CONNECTED,
  CONFIRM_ADDRESS,
  INITIAL,
  PendingState,
  PROMPT_SIGNATURE,
} from 'types/Wallet';
import { useModalActions } from 'contexts/modal/ModalContext';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
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
import useAddWallet from 'components/WalletSelector/mutations/useAddWallet';
import useCreateNonce from 'components/WalletSelector/mutations/useCreateNonce';
import { normalizeError } from '../normalizeError';
import { WalletError } from '../WalletError';
import { DAppClient } from '@airgap/beacon-sdk';
import { generatePayload, getNonceNumber } from './tezosUtils';

type Props = {
  queryRef: EthereumAddWalletFragment$key;
  reset: () => void;
};

let beaconClient: DAppClient;

if (typeof window !== 'undefined') {
  beaconClient = new DAppClient({ name: 'Gallery' });
}

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
export const TezosAddWallet = ({ queryRef, reset }: Props) => {
  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error>();
  const [account, setAccount] = useState<string>();
  const [publicKey, setPublicKey] = useState<string>();

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
        const { signature } = await beaconClient.requestSignPayload(payload);

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

        console.log(signatureValid);

        trackAddWalletSuccess('Tezos');
        openManageWalletsModal(address);
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
      addWallet,
      trackAddWalletSuccess,
      openManageWalletsModal,
      trackAddWalletError,
    ]
  );

  useEffect(() => {
    async function authenticate() {
      console.log('pending state', pendingState);

      if (account && authenticatedUserAddresses.includes(account)) {
        setPendingState(ADDRESS_ALREADY_CONNECTED);
        return;
      }

      try {
        console.log(`Authenticating....`);
        const { publicKey, address } = await beaconClient.requestPermissions();
        if (!address || !publicKey) return;

        setPendingState(CONFIRM_ADDRESS);
        setAccount(address);
        setPublicKey(publicKey);

        await attemptAddWallet(address, publicKey);
      } catch (error) {
        setError(normalizeError(error));
      }
    }

    if (pendingState === INITIAL) {
      void authenticate();
    }
  }, [account, authenticatedUserAddresses, attemptAddWallet, pendingState]);

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
      <div>
        <TitleS>Connect with Ethereum</TitleS>
        <Spacer height={8} />
        <BaseM>The following address is already connected to this account:</BaseM>
        <Spacer height={8} />
        <BaseM color={colors.offBlack}>{account}</BaseM>
      </div>
    );
  }

  // right now we only show this case for Metamask
  if (pendingState === CONFIRM_ADDRESS && account && publicKey) {
    return (
      <div>
        <TitleS>Connect with Tezos</TitleS>
        <Spacer height={8} />
        <BaseM>Confirm the following wallet address:</BaseM>
        <Spacer height={8} />
        <BaseM color={colors.offBlack}>{account}</BaseM>
        <Spacer height={16} />
        <BaseM>
          If you want to connect a different address via Tezos wallet, please switch accounts in the
          extension and try again.
        </BaseM>
        <Spacer height={24} />
        <StyledButton onClick={() => attemptAddWallet(account, publicKey)} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Confirm'}
        </StyledButton>
      </div>
    );
  }

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <div>
        <TitleS>Connect with Tezos</TitleS>
        <Spacer height={8} />
        <BaseM>Sign the message with your wallet.</BaseM>
      </div>
    );
  }

  // Default view for when pendingState === INITIAL
  return (
    <div>
      <TitleS>Connect with Tezos</TitleS>
      <Spacer height={8} />
      <BaseM>Approve your wallet to connect to Gallery.</BaseM>
    </div>
  );
};

const StyledButton = styled(Button)`
  align-self: flex-end;
  padding: 16px;
  width: 100%;
  height: 100%;
`;

import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import colors from 'components/core/colors';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useCallback, useEffect, useMemo, useState } from 'react';
import GnosisSafePendingMessage from '../GnosisSafePendingMessage';
import { normalizeError } from './normalizeError';

import { Web3Error } from 'types/Error';
import Spacer from 'components/core/Spacer/Spacer';
import {
  ADDRESS_ALREADY_CONNECTED,
  INITIAL,
  PROMPT_SIGNATURE,
  PendingState,
  LISTENING_ONCHAIN,
} from 'types/Wallet';
import { useModalActions } from 'contexts/modal/ModalContext';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import {
  listenForGnosisSignature,
  signMessageWithContractAccount,
  validateNonceSignedByGnosis,
} from '../walletUtils';
import { getLocalStorageItem } from 'utils/localStorage';
import { GNOSIS_NONCE_STORAGE_KEY } from 'constants/storageKeys';
import {
  useTrackAddWalletAttempt,
  useTrackAddWalletSuccess,
  useTrackAddWalletError,
  isEarlyAccessError,
} from 'contexts/analytics/authUtil';
import { captureException } from '@sentry/nextjs';
import { graphql, useFragment } from 'react-relay';
import { GnosisSafeAddWalletFragment$key } from '__generated__/GnosisSafeAddWalletFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import useCreateNonce from '../mutations/useCreateNonce';
import useAddWallet from '../mutations/useAddWallet';
import { EthereumError } from './EthereumError';
import { useConnectGnosisSafe } from './useConnectGnosisSafe';
import { walletconnect } from '../../../connectors';

type Props = {
  queryRef: GnosisSafeAddWalletFragment$key;
  reset: () => void;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
export const GnosisSafeAddWallet = ({ queryRef, reset }: Props) => {
  const connectGnosisSafe = useConnectGnosisSafe();

  const { account } = useWeb3React<Web3Provider>();
  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);

  const previousAttemptNonce = useMemo(() => getLocalStorageItem(GNOSIS_NONCE_STORAGE_KEY), []);
  const [nonce, setNonce] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [authenticationFlowStarted, setAuthenticationFlowStarted] = useState(false);
  const [error, setError] = useState<Error>();

  const query = useFragment(
    graphql`
      fragment GnosisSafeAddWalletFragment on Query {
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
    [query, showModal]
  );

  const trackAddWalletAttempt = useTrackAddWalletAttempt();
  const trackAddWalletSuccess = useTrackAddWalletSuccess();
  const trackAddWalletError = useTrackAddWalletError();

  const handleError = useCallback(
    (error: unknown) => {
      trackAddWalletError('Gnosis Safe', error);

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
    },
    [trackAddWalletError]
  );

  const addWallet = useAddWallet();
  const authenticateWithBackend = useCallback(
    async (address: string, nonce: string) => {
      const { signatureValid } = await addWallet({
        chainAddress: {
          address,
          chain: 'Ethereum',
        },
        authMechanism: {
          gnosisSafe: {
            address,
            nonce,
          },
        },
      });

      if (!signatureValid) {
        throw new Error('Signature is not valid');
      }

      trackAddWalletSuccess('Gnosis Safe');
      openManageWalletsModal(address);
    },
    [addWallet, openManageWalletsModal, trackAddWalletSuccess]
  );

  // Initiates the full authentication flow including signing the message, listening for the signature, validating it. then calling the backend
  // This is the default flow
  const attemptAddWallet = useCallback(
    async (address: string, nonce: string, userExists: boolean) => {
      try {
        if (userExists) {
          throw { code: 'EXISTING_USER' } as Web3Error;
        }

        setPendingState(PROMPT_SIGNATURE);
        trackAddWalletAttempt('Gnosis Safe');
        await signMessageWithContractAccount(address, nonce, walletconnect);
        window.localStorage.setItem(GNOSIS_NONCE_STORAGE_KEY, JSON.stringify(nonce));

        setPendingState(LISTENING_ONCHAIN);
        await listenForGnosisSignature(address, nonce, walletconnect);

        await authenticateWithBackend(address, nonce);
      } catch (error: unknown) {
        handleError(error);
      }
    },
    [trackAddWalletAttempt, authenticateWithBackend, handleError]
  );

  // Validates the signature on-chain. If it hasnt been signed yet, initializes a listener to wait for the SignMsg event.
  // This is used in 2 cases:
  // 1. The user has previously tried to sign a message, and they opted to retry using the same nonce+transaction
  // 2. This gets automatically called on an interval as a backup to validate the signature in case the listener fails to detect the SignMsg event
  const manuallyValidateSignature = useCallback(async () => {
    if (!account) {
      return;
    }

    try {
      // Immediately check if the message has already been signed and executed on chain
      const wasSigned = await validateNonceSignedByGnosis(account, nonce, walletconnect);
      if (wasSigned) {
        await authenticateWithBackend(account, nonce);
      }

      // If it hasn't, set up a listener because the transaction may not have been executed yet
      if (pendingState !== LISTENING_ONCHAIN) {
        setPendingState(LISTENING_ONCHAIN);
        await listenForGnosisSignature(account, nonce, walletconnect);
        // Once signed, call the backend as usual
        void authenticateWithBackend(account, nonce);
      }
    } catch (error: unknown) {
      handleError(error);
    }
  }, [account, authenticateWithBackend, handleError, pendingState, nonce]);

  const restartAuthentication = useCallback(async () => {
    if (account) {
      await attemptAddWallet(account.toLowerCase(), nonce, userExists);
    }
  }, [account, attemptAddWallet, nonce, userExists]);

  const createNonce = useCreateNonce();

  // This runs once to auto-initiate the authentication flow, when wallet is first connected (ie when 'account' is defined)
  useEffect(() => {
    if (authenticationFlowStarted) {
      return;
    }

    async function initiateAuthentication() {
      setAuthenticationFlowStarted(true);

      const account = await connectGnosisSafe();
      if (authenticatedUserAddresses.includes(account.toLowerCase())) {
        setPendingState(ADDRESS_ALREADY_CONNECTED);
        return;
      }

      const { nonce, user_exists: userExists } = await createNonce(account, 'Ethereum');
      setNonce(nonce);
      setUserExists(userExists);

      if (nonce === previousAttemptNonce) {
        return;
      }

      await attemptAddWallet(account.toLowerCase(), nonce, userExists);
    }

    void initiateAuthentication().catch(handleError);
  }, [
    connectGnosisSafe,
    authenticatedUserAddresses,
    attemptAddWallet,
    authenticationFlowStarted,
    handleError,
    previousAttemptNonce,
    createNonce,
  ]);

  if (error) {
    return (
      <EthereumError
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
        <TitleS>Connect with Gnosis Safe</TitleS>
        <Spacer height={8} />
        <BaseM>The following address is already connected to this account:</BaseM>
        <Spacer height={8} />
        <BaseM color={colors.offBlack}>{account.toLowerCase()}</BaseM>
      </div>
    );
  }

  return (
    <GnosisSafePendingMessage
      pendingState={pendingState}
      userFriendlyWalletName="Gnosis Safe"
      onRestartClick={restartAuthentication}
      manuallyValidateSignature={manuallyValidateSignature}
    />
  );
};

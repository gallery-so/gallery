import { Web3Provider } from '@ethersproject/providers';
import { captureException } from '@sentry/nextjs';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetUserByWalletAddressImperatively } from 'shared/hooks/useGetUserByWalletAddress';

import { walletconnect } from '~/connectors/index';
import { GNOSIS_NONCE_STORAGE_KEY } from '~/constants/storageKeys';
import {
  isEarlyAccessError,
  useTrackCreateUserSuccess,
  useTrackSignInAttempt,
  useTrackSignInError,
  useTrackSignInSuccess,
} from '~/contexts/analytics/authUtil';
import useCreateNonce from '~/shared/hooks/useCreateNonce';
import { Web3Error } from '~/types/Error';
import { INITIAL, LISTENING_ONCHAIN, PendingState, PROMPT_SIGNATURE } from '~/types/Wallet';
import { getLocalStorageItem } from '~/utils/localStorage';

import GnosisSafePendingMessage from '../GnosisSafePendingMessage';
import useLoginOrRedirectToOnboarding from '../mutations/useLoginOrRedirectToOnboarding';
import {
  listenForGnosisSignature,
  signMessageWithContractAccount,
  validateNonceSignedByGnosis,
} from '../walletUtils';
import { normalizeError } from './normalizeError';
import { useConnectGnosisSafe } from './useConnectGnosisSafe';
import { WalletError } from './WalletError';

type Props = {
  reset: () => void;
};

export const GnosisSafeAuthenticateWallet = ({ reset }: Props) => {
  const connectGnosisSafe = useConnectGnosisSafe();
  const { account } = useWeb3React<Web3Provider>();
  const [error, setError] = useState<Error>();

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);

  const previousAttemptNonce = useMemo(() => getLocalStorageItem(GNOSIS_NONCE_STORAGE_KEY), []);
  const [nonce, setNonce] = useState('');
  const [message, setMessage] = useState('');
  const [userExists, setUserExists] = useState(false);

  const [loginOrRedirectToOnboarding] = useLoginOrRedirectToOnboarding();
  const trackSignInAttempt = useTrackSignInAttempt();
  const trackSignInSuccess = useTrackSignInSuccess();
  const trackSignInError = useTrackSignInError();
  const trackCreateUserSuccess = useTrackCreateUserSuccess('Gnosis Safe');

  const authenticateWithBackend = useCallback(
    async ({ address, nonce, message }: { address: string; nonce: string; message: string }) => {
      const userId = await loginOrRedirectToOnboarding({
        authMechanism: {
          mechanism: { gnosisSafe: { address, nonce, message } },
        },
        userExists,
        userFriendlyWalletName: 'Gnosis Safe',
      });

      if (userExists) {
        trackCreateUserSuccess();
      }

      window.localStorage.removeItem(GNOSIS_NONCE_STORAGE_KEY);

      if (userId) {
        trackSignInSuccess('Gnosis Safe');
      }
    },
    [loginOrRedirectToOnboarding, trackCreateUserSuccess, trackSignInSuccess, userExists]
  );

  const handleError = useCallback(
    (error: unknown) => {
      trackSignInError('Gnosis Safe', error);

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
    [trackSignInError]
  );

  const [authenticationFlowStarted, setAuthenticationFlowStarted] = useState(false);

  // Initiates the full authentication flow including signing the message, listening for the signature, validating it. then calling the backend
  // This is the default flow
  const attemptAuthentication = useCallback(
    async ({ address, nonce, message }: { address: string; nonce: string; message: string }) => {
      try {
        // Prompt the user to sign the message. Store the nonce in local storage, so if something goes wrong we can detect there was a previous attempt.
        setPendingState(PROMPT_SIGNATURE);
        await signMessageWithContractAccount(address, message, walletconnect);
        window.localStorage.setItem(GNOSIS_NONCE_STORAGE_KEY, JSON.stringify(message));

        // Listen for the signature to be signed by the Gnosis Safe
        setPendingState(LISTENING_ONCHAIN);
        await listenForGnosisSignature(address, message, walletconnect);

        await authenticateWithBackend({ address, nonce, message });
      } catch (error: unknown) {
        console.error(error);
        handleError(error);
      }
    },
    [authenticateWithBackend, handleError]
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
      const wasSigned = await validateNonceSignedByGnosis(account, message, walletconnect);
      if (wasSigned) {
        await authenticateWithBackend({
          address: account.toLowerCase(),
          nonce,
          message,
        });
      }

      // If it hasn't, set up a listener because the transaction may not have been executed yet
      if (pendingState !== LISTENING_ONCHAIN) {
        setPendingState(LISTENING_ONCHAIN);
        await listenForGnosisSignature(account, message, walletconnect);
        // Once signed, call the backend as usual
        void authenticateWithBackend({ address: account.toLowerCase(), nonce, message });
      }
    } catch (error: unknown) {
      handleError(error);
    }
  }, [account, authenticateWithBackend, handleError, message, nonce, pendingState]);

  const restartAuthentication = useCallback(async () => {
    if (account) {
      await attemptAuthentication({
        address: account.toLowerCase(),
        nonce,
        message,
      });
    }
  }, [account, attemptAuthentication, message, nonce]);

  const createNonce = useCreateNonce();
  const getUserByWalletAddress = useGetUserByWalletAddressImperatively();

  // This runs once to auto-initiate the authentication flow, when wallet is first connected (ie when 'account' is defined)
  useEffect(() => {
    if (authenticationFlowStarted) {
      return;
    }

    async function initiateAuthentication() {
      setAuthenticationFlowStarted(true);

      const account = await connectGnosisSafe();
      const address = account.toLowerCase();
      trackSignInAttempt('Gnosis Safe');
      const { nonce, message } = await createNonce();

      const userExistsOnGallery = Boolean(
        await getUserByWalletAddress({ address, chain: 'Ethereum' })
      );

      setNonce(nonce);
      setMessage(message);
      setUserExists(userExistsOnGallery);

      if (nonce === previousAttemptNonce) {
        return;
      }

      await attemptAuthentication({
        address,
        nonce,
        message,
      });
    }

    void initiateAuthentication().catch(handleError);
  }, [
    connectGnosisSafe,
    attemptAuthentication,
    authenticationFlowStarted,
    createNonce,
    handleError,
    previousAttemptNonce,
    trackSignInAttempt,
    getUserByWalletAddress,
    userExists,
  ]);

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

  return (
    <GnosisSafePendingMessage
      pendingState={pendingState}
      userFriendlyWalletName="Gnosis Safe"
      onRestartClick={restartAuthentication}
      manuallyValidateSignature={manuallyValidateSignature}
    />
  );
};

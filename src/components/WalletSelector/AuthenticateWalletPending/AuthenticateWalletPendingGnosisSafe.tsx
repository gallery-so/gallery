import { useCallback, useEffect, useMemo, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { isWeb3Error, Web3Error } from 'types/Error';
import { INITIAL, PROMPT_SIGNATURE, PendingState, LISTENING_ONCHAIN } from 'types/Wallet';
import GnosisSafePendingMessage from '../GnosisSafePendingMessage';
import {
  listenForGnosisSignature,
  signMessageWithContractAccount,
  validateNonceSignedByGnosis,
} from '../walletUtils';
import { GNOSIS_NONCE_STORAGE_KEY } from 'constants/storageKeys';
import { getLocalStorageItem } from 'utils/localStorage';
import {
  useTrackSignInAttempt,
  useTrackSignInSuccess,
  useTrackSignInError,
  useTrackCreateUserSuccess,
  isNotEarlyAccessError,
} from 'contexts/analytics/authUtil';
import { captureException } from '@sentry/nextjs';
import useCreateNonce from '../mutations/useCreateNonce';
import useLoginOrRedirectToOnboarding from '../mutations/useLoginOrRedirectToOnboarding';

type Props = {
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
};

function AuthenticateWalletPendingGnosisSafe({
  pendingWallet,
  userFriendlyWalletName,
  setDetectedError,
}: Props) {
  const { account } = useWeb3React<Web3Provider>();

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);

  const { handleLogin } = useAuthActions();

  const previousAttemptNonce = useMemo(() => getLocalStorageItem(GNOSIS_NONCE_STORAGE_KEY), []);
  const [nonce, setNonce] = useState('');
  const [userExists, setUserExists] = useState(false);

  const loginOrRedirectToOnboarding = useLoginOrRedirectToOnboarding();
  const trackSignInAttempt = useTrackSignInAttempt();
  const trackSignInSuccess = useTrackSignInSuccess();
  const trackSignInError = useTrackSignInError();
  const trackCreateUserSuccess = useTrackCreateUserSuccess('Gnosis Safe');

  const authenticateWithBackend = useCallback(
    async (address: string, nonce: string) => {
      const userId = await loginOrRedirectToOnboarding({
        authMechanism: {
          mechanism: { gnosisSafe: { address, nonce } },
        },
        userExists,
        userFriendlyWalletName: 'Gnosis Safe',
      });

      if (userExists) {
        trackCreateUserSuccess();
      }

      window.localStorage.removeItem(GNOSIS_NONCE_STORAGE_KEY);

      trackSignInSuccess('Gnosis Safe');
      if (userId) {
        handleLogin(userId, address);
      }
    },
    [
      loginOrRedirectToOnboarding,
      handleLogin,
      trackCreateUserSuccess,
      trackSignInSuccess,
      userExists,
    ]
  );

  const handleError = useCallback(
    (error: unknown) => {
      trackSignInError('Gnosis Safe', error);
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
    },
    [setDetectedError, trackSignInError]
  );
  const [authenticationFlowStarted, setAuthenticationFlowStarted] = useState(false);

  // Initiates the full authentication flow including signing the message, listening for the signature, validating it. then calling the backend
  // This is the default flow
  const attemptAuthentication = useCallback(
    async (address: string, nonce: string) => {
      try {
        // Prompt the user to sign the message. Store the nonce in local storage, so if something goes wrong we can detect there was a previous attempt.
        setPendingState(PROMPT_SIGNATURE);
        await signMessageWithContractAccount(address, nonce, pendingWallet);
        window.localStorage.setItem(GNOSIS_NONCE_STORAGE_KEY, JSON.stringify(nonce));

        // Listen for the signature to be signed by the Gnosis Safe
        setPendingState(LISTENING_ONCHAIN);
        await listenForGnosisSignature(address, nonce, pendingWallet);

        await authenticateWithBackend(address, nonce);
      } catch (error: unknown) {
        console.error(error);
        handleError(error);
      }
    },
    [authenticateWithBackend, handleError, pendingWallet]
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
      const wasSigned = await validateNonceSignedByGnosis(account, nonce, pendingWallet);
      if (wasSigned) {
        await authenticateWithBackend(account, nonce);
      }

      // If it hasn't, set up a listener because the transaction may not have been executed yet
      if (pendingState !== LISTENING_ONCHAIN) {
        setPendingState(LISTENING_ONCHAIN);
        await listenForGnosisSignature(account, nonce, pendingWallet);
        // Once signed, call the backend as usual
        void authenticateWithBackend(account, nonce);
      }
    } catch (error: unknown) {
      handleError(error);
    }
  }, [account, authenticateWithBackend, handleError, pendingWallet, nonce, pendingState]);

  const restartAuthentication = useCallback(async () => {
    if (account) {
      await attemptAuthentication(account.toLowerCase(), nonce);
    }
  }, [account, attemptAuthentication, nonce]);

  const createNonce = useCreateNonce();

  // This runs once to auto-initiate the authentication flow, when wallet is first connected (ie when 'account' is defined)
  useEffect(() => {
    if (authenticationFlowStarted) {
      return;
    }

    async function initiateAuthentication() {
      if (account) {
        setAuthenticationFlowStarted(true);
        try {
          trackSignInAttempt('Gnosis Safe');
          const { nonce, user_exists: userExists } = await createNonce(account);
          setNonce(nonce);
          setUserExists(userExists);

          if (nonce === previousAttemptNonce) {
            return;
          }

          await attemptAuthentication(account.toLowerCase(), nonce);
        } catch (error: unknown) {
          handleError(error);
        }
      }
    }

    void initiateAuthentication();
  }, [
    account,
    attemptAuthentication,
    authenticationFlowStarted,
    createNonce,
    handleError,
    previousAttemptNonce,
    trackSignInAttempt,
  ]);

  return (
    <GnosisSafePendingMessage
      pendingState={pendingState}
      userFriendlyWalletName={userFriendlyWalletName}
      onRestartClick={restartAuthentication}
      manuallyValidateSignature={manuallyValidateSignature}
    />
  );
}

export default AuthenticateWalletPendingGnosisSafe;

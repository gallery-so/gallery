import { useCallback, useEffect, useState } from 'react';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { INITIAL, PROMPT_SIGNATURE, PendingState } from 'types/Wallet';
import Spacer from 'components/core/Spacer/Spacer';
import {
  isEarlyAccessError,
  useTrackSignInAttempt,
  useTrackSignInError,
  useTrackSignInSuccess,
} from 'contexts/analytics/authUtil';
import { captureException } from '@sentry/nextjs';
import useCreateNonce from '../mutations/useCreateNonce';
import useLoginOrRedirectToOnboarding from '../mutations/useLoginOrRedirectToOnboarding';
import { useAccount } from 'wagmi';
import { EthereumError } from './EthereumError';
import { normalizeError } from './normalizeError';
import { signMessage } from '@wagmi/core';

type Props = {
  reset: () => void;
};

export const EthereumAuthenticateWallet = ({ reset }: Props) => {
  const { address: account } = useAccount();

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);
  const [error, setError] = useState<Error>();

  const { handleLogin } = useAuthActions();

  const createNonce = useCreateNonce();
  const loginOrRedirectToOnboarding = useLoginOrRedirectToOnboarding();

  const trackSignInAttempt = useTrackSignInAttempt();
  const trackSignInSuccess = useTrackSignInSuccess();
  const trackSignInError = useTrackSignInError();

  /**
   * Auth Pipeline:
   * 1. Fetch nonce from server with provided wallet address
   * 2. Sign nonce with wallet (metamask / walletconnect / etc.)
   * 3a. If wallet exists, log user in
   * 3b. If wallet is new, sign user up
   */
  const attemptAuthentication = useCallback(
    async (address: string) => {
      setPendingState(PROMPT_SIGNATURE);
      trackSignInAttempt('Ethereum');

      const { nonce, user_exists: userExists } = await createNonce(address);

      const signature = await signMessage({ message: nonce });

      const userId = await loginOrRedirectToOnboarding({
        authMechanism: {
          mechanism: {
            eoa: {
              chainAddress: {
                chain: 'Ethereum',
                address,
              },
              nonce,
              signature,
            },
          },
        },
        userExists,
      });

      if (userExists && userId) {
        trackSignInSuccess('Ethereum');
        return await handleLogin(userId, address);
      }
    },
    [trackSignInAttempt, createNonce, loginOrRedirectToOnboarding, trackSignInSuccess, handleLogin]
  );

  useEffect(() => {
    async function authenticate() {
      if (account) {
        try {
          await attemptAuthentication(account.toLowerCase());
        } catch (error: unknown) {
          trackSignInError('Ethereum', error);
          // ignore early access errors
          if (!isEarlyAccessError(error)) {
            // capture all others
            captureException(error);
          }

          setError(normalizeError(error));
        }
      }
    }

    void authenticate();
  }, [account, attemptAuthentication, trackSignInError]);

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

  // TODO: add pending state between fetching nonce and signing?

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <div>
        <TitleS>Connect with Ethereum</TitleS>
        <Spacer height={8} />
        <BaseM>Sign the message with your wallet.</BaseM>
      </div>
    );
  }

  return (
    <div>
      <TitleS>Connect with Ethereum</TitleS>
      <Spacer height={8} />
      <BaseM>Approve your wallet to connect to Gallery.</BaseM>
    </div>
  );
};

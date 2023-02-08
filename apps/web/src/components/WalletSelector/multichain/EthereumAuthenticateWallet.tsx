import { captureException } from '@sentry/nextjs';
import { signMessage } from '@wagmi/core';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { EmptyState } from '~/components/EmptyState/EmptyState';
import {
  isEarlyAccessError,
  useTrackSignInAttempt,
  useTrackSignInError,
  useTrackSignInSuccess,
} from '~/contexts/analytics/authUtil';
import { useAuthActions } from '~/contexts/auth/AuthContext';
import { INITIAL, PendingState, PROMPT_SIGNATURE } from '~/types/Wallet';

import useCreateNonce from '../mutations/useCreateNonce';
import useLoginOrRedirectToOnboarding from '../mutations/useLoginOrRedirectToOnboarding';
import { normalizeError } from './normalizeError';
import { WalletError } from './WalletError';

type Props = {
  reset: () => void;
};

export const EthereumAuthenticateWallet = ({ reset }: Props) => {
  const { address: account } = useAccount();

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);
  const [error, setError] = useState<Error>();

  const { handleLogin } = useAuthActions();

  const createNonce = useCreateNonce();
  const [loginOrRedirectToOnboarding] = useLoginOrRedirectToOnboarding();

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

      const { nonce, user_exists: userExists } = await createNonce(address, 'Ethereum');

      const signature = await signMessage({ message: nonce });

      const userId = await loginOrRedirectToOnboarding({
        authMechanism: {
          mechanism: {
            eoa: {
              chainPubKey: {
                chain: 'Ethereum',
                pubKey: address,
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
        return await handleLogin(userId);
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

  // TODO: add pending state between fetching nonce and signing?

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <EmptyState title="Connect with Ethereum" description="Sign the message with your wallet." />
    );
  }

  return (
    <EmptyState title="Connect with Ethereum" description="Sign the message with your wallet." />
  );
};

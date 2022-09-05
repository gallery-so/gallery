import { useCallback, useEffect, useState } from 'react';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { INITIAL, PROMPT_SIGNATURE, PendingState } from 'types/Wallet';
import {
  isEarlyAccessError,
  useTrackSignInAttempt,
  useTrackSignInError,
  useTrackSignInSuccess,
} from 'contexts/analytics/authUtil';
import { captureException } from '@sentry/nextjs';
import useCreateNonce from 'components/WalletSelector/mutations/useCreateNonce';
import useLoginOrRedirectToOnboarding from 'components/WalletSelector/mutations/useLoginOrRedirectToOnboarding';
import { WalletError } from '../WalletError';
import { normalizeError } from '../normalizeError';
import { generatePayload, getNonceNumber } from './tezosUtils';
import { useBeaconState } from 'contexts/beacon/BeaconContext';
import WalletOnboardingMessage from '../WalletOnboardingMessage';

type Props = {
  reset: () => void;
};

export const TezosAuthenticateWallet = ({ reset }: Props) => {
  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);
  const [error, setError] = useState<Error>();
  const [address, setAddress] = useState<string>();

  const beaconClient = useBeaconState();

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
    async (address: string, publicKey: string) => {
      console.log('Requesting permissions...');

      setPendingState(PROMPT_SIGNATURE);
      trackSignInAttempt('Tezos');

      const { nonce, user_exists: userExists } = await createNonce(address, 'Tezos');

      const payload = generatePayload(nonce, address);

      const { signature } = await beaconClient.requestSignPayload(payload);

      const nonceNumber = getNonceNumber(nonce);

      const userId = await loginOrRedirectToOnboarding({
        authMechanism: {
          mechanism: {
            eoa: {
              chainPubKey: {
                pubKey: publicKey,
                chain: 'Tezos',
              },
              nonce: nonceNumber,
              signature,
            },
          },
        },
        userExists,
      });

      if (userExists && userId) {
        trackSignInSuccess('Tezos');
        return await handleLogin(userId, address);
      }
    },
    [
      trackSignInAttempt,
      beaconClient,
      createNonce,
      loginOrRedirectToOnboarding,
      trackSignInSuccess,
      handleLogin,
    ]
  );

  useEffect(() => {
    async function authenticate() {
      try {
        const { publicKey, address } = await beaconClient.requestPermissions();

        if (!address || !publicKey) return;
        setAddress(address);
        await attemptAuthentication(address, publicKey);
      } catch (error) {
        trackSignInError('Tezos', error);
        // ignore early access errors
        if (!isEarlyAccessError(error)) {
          // capture all others
          captureException(error);
        }
        setError(normalizeError(error));
      }
    }

    void authenticate();
  }, [attemptAuthentication, beaconClient, trackSignInError]);

  if (error) {
    return (
      <WalletError
        address={address}
        error={error}
        reset={() => {
          setError(undefined);
          reset();
        }}
      />
    );
  }

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <WalletOnboardingMessage
        title="Connect with Tezos wallet"
        description="Sign the message with your wallet."
      />
    );
  }

  // Default view for when pendingState === INITIAL
  return (
    <WalletOnboardingMessage
      title="Connect with Tezos wallet"
      description="Approve your wallet to connect to Gallery."
    />
  );
};

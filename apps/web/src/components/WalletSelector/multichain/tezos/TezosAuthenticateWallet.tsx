import { captureException } from '@sentry/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { useGetUserByWalletAddressImperatively } from 'shared/hooks/useGetUserByWalletAddress';

import { EmptyState } from '~/components/EmptyState/EmptyState';
import useLoginOrRedirectToOnboarding from '~/components/WalletSelector/mutations/useLoginOrRedirectToOnboarding';
import {
  isEarlyAccessError,
  useTrackSignInAttempt,
  useTrackSignInError,
  useTrackSignInSuccess,
} from '~/contexts/analytics/authUtil';
import { useBeaconActions } from '~/contexts/beacon/BeaconContext';
import useCreateNonce from '~/shared/hooks/useCreateNonce';
import { INITIAL, PendingState, PROMPT_SIGNATURE } from '~/types/Wallet';

import { normalizeError } from '../normalizeError';
import { WalletError } from '../WalletError';
import { generatePayload, getNonceNumber } from './tezosUtils';

type Props = {
  reset: () => void;
};

export const TezosAuthenticateWallet = ({ reset }: Props) => {
  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);
  const [error, setError] = useState<Error>();
  const [address, setAddress] = useState<string>();
  const [wallet, setWallet] = useState<string>();

  const messageHeaderText = `Connect with ${wallet || 'Tezos'} wallet`;

  const { getActiveAccount, requestSignature } = useBeaconActions();

  const createNonce = useCreateNonce();
  const getUserByWalletAddress = useGetUserByWalletAddressImperatively();
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
    async (address: string, publicKey: string) => {
      console.log('Requesting permissions...');

      setPendingState(PROMPT_SIGNATURE);
      trackSignInAttempt('Tezos');

      const { nonce, message } = await createNonce();

      const userExists = Boolean(await getUserByWalletAddress({ address, chain: 'Tezos' }));

      const payload = generatePayload(message, address);

      // the app will hang until a signature is provided
      const signature = await requestSignature(payload);

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
              message,
              signature,
            },
          },
        },
        userExists,
      });

      if (userExists && userId) {
        trackSignInSuccess('Tezos');
      }
    },
    [
      createNonce,
      getUserByWalletAddress,
      loginOrRedirectToOnboarding,
      requestSignature,
      trackSignInAttempt,
      trackSignInSuccess,
    ]
  );

  useEffect(() => {
    async function authenticate() {
      try {
        const { publicKey, address, wallet } = await getActiveAccount();

        if (!address || !publicKey) return;
        setAddress(address);
        setWallet(wallet);
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
  }, [attemptAuthentication, getActiveAccount, trackSignInError]);

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
      <EmptyState title={messageHeaderText} description="Sign the message with your wallet." />
    );
  }

  // Default view for when pendingState === INITIAL
  return (
    <EmptyState
      title={messageHeaderText}
      description="Approve your wallet to connect to Gallery."
    />
  );
};

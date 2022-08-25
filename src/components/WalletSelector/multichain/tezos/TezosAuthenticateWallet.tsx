import { useCallback, useEffect, useMemo, useState } from 'react';
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
import useCreateNonce from 'components/WalletSelector/mutations/useCreateNonce';
import useLoginOrRedirectToOnboarding from 'components/WalletSelector/mutations/useLoginOrRedirectToOnboarding';
import { EthereumError } from '../EthereumError';
import { normalizeError } from '../normalizeError';
import { DAppClient, RequestSignPayloadInput, SigningType } from '@airgap/beacon-sdk';
import { char2Bytes, bytes2Char } from '@taquito/utils';

type Props = {
  reset: () => void;
};

export const TezosAuthenticateWallet = ({ reset }: Props) => {
  const dAppClient = useMemo(() => {
    return new DAppClient({ name: 'Gallery' });
  }, []);

  console.log(bytes2Char('0x05'));

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
    async (address: string, publicKey: string) => {
      console.log('Requesting permissions...');

      setPendingState(PROMPT_SIGNATURE);
      trackSignInAttempt('Tezos');

      const { nonce, user_exists: userExists } = await createNonce(publicKey, 'Tezos');

      // Gallery uses this cryptographic signature in place of a password: 2204289372043769609
      console.log(nonce);

      const formattedInput: string = ['Tezos Signed Message:', nonce].join(' ');

      const bytes = char2Bytes(formattedInput);
      // const bytes = char2Bytes(nonce);

      // https://tezostaquito.io/docs/signing
      const payloadBytes = '05' + '01' + '00' + char2Bytes(bytes.length.toString()) + bytes;

      const payload: RequestSignPayloadInput = {
        signingType: SigningType.MICHELINE,
        payload: payloadBytes,
        sourceAddress: address,
      };

      const { signature } = await dAppClient.requestSignPayload(payload);

      const userId = await loginOrRedirectToOnboarding({
        authMechanism: {
          mechanism: {
            eoa: {
              chainAddress: {
                chain: 'Tezos',
                address: publicKey,
              },
              // nonce: formattedInput,
              nonce,
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
      createNonce,
      loginOrRedirectToOnboarding,
      trackSignInSuccess,
      handleLogin,
      dAppClient,
    ]
  );

  useEffect(() => {
    async function authenticate() {
      const { publicKey, address } = await dAppClient.requestPermissions();

      if (address) {
        try {
          await attemptAuthentication(address, publicKey.toLowerCase());
        } catch (error) {
          console.log(error);
          trackSignInError('Tezos', error);
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
  }, [attemptAuthentication, trackSignInError, dAppClient]);

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
        <TitleS>Connect with Tezos</TitleS>
        <Spacer height={8} />
        <BaseM>Sign the message with your wallet.</BaseM>
      </div>
    );
  }

  return (
    <div>
      <TitleS>Connect with Tezos</TitleS>
      <Spacer height={8} />
      <BaseM>Approve your wallet to connect to Gallery.</BaseM>
    </div>
  );
};

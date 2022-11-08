import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { captureException } from '@sentry/nextjs';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import {
  isNotEarlyAccessError,
  useTrackSignInAttempt,
  useTrackSignInError,
  useTrackSignInSuccess,
} from '~/contexts/analytics/authUtil';
import { useAuthActions } from '~/contexts/auth/AuthContext';
import { isWeb3Error, Web3Error } from '~/types/Error';
import { INITIAL, PendingState, PROMPT_SIGNATURE } from '~/types/Wallet';

import useCreateNonce from '../mutations/useCreateNonce';
import useLoginOrRedirectToOnboarding from '../mutations/useLoginOrRedirectToOnboarding';
import { signMessageWithEOA } from '../walletUtils';

type Props = {
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
};

function AuthenticateWalletPendingDefault({
  pendingWallet,
  userFriendlyWalletName,
  setDetectedError,
}: Props) {
  const { library, account } = useWeb3React<Web3Provider>();
  const signer = useMemo(
    () => (library && account ? library.getSigner(account) : undefined),
    [library, account]
  );

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);

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
    async (address: string, signer: JsonRpcSigner) => {
      setPendingState(PROMPT_SIGNATURE);
      trackSignInAttempt(userFriendlyWalletName);

      const { nonce, user_exists: userExists } = await createNonce(address, 'Ethereum');

      const signature = await signMessageWithEOA(address, nonce, signer, pendingWallet);

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
        userFriendlyWalletName,
      });

      if (userExists && userId) {
        trackSignInSuccess(userFriendlyWalletName);
        return await handleLogin(userId, address);
      }
    },
    [
      trackSignInAttempt,
      userFriendlyWalletName,
      createNonce,
      pendingWallet,
      loginOrRedirectToOnboarding,
      handleLogin,
      trackSignInSuccess,
    ]
  );

  useEffect(() => {
    async function authenticate() {
      if (account && signer) {
        try {
          await attemptAuthentication(account.toLowerCase(), signer);
        } catch (error: unknown) {
          trackSignInError(userFriendlyWalletName, error);

          if (isWeb3Error(error)) {
            // dont log error if because user is not early access
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
        }
      }
    }

    void authenticate();
  }, [
    account,
    signer,
    setDetectedError,
    attemptAuthentication,
    userFriendlyWalletName,
    trackSignInError,
  ]);

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <VStack gap={8}>
        <TitleS>Connect with {userFriendlyWalletName}</TitleS>
        <BaseM>Sign the message with your wallet.</BaseM>
      </VStack>
    );
  }

  return (
    <VStack gap={8}>
      <TitleS>Connect with {userFriendlyWalletName}</TitleS>
      <BaseM>Approve your wallet to connect to Gallery.</BaseM>
    </VStack>
  );
}

export default AuthenticateWalletPendingDefault;

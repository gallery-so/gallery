import { useCallback, useEffect, useState } from 'react';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { isWeb3Error, Web3Error } from 'types/Error';
import { INITIAL, PROMPT_SIGNATURE, PendingState, WalletName } from 'types/Wallet';
import Spacer from 'components/core/Spacer/Spacer';
import {
  isNotEarlyAccessError,
  useTrackSignInAttempt,
  useTrackSignInError,
  useTrackSignInSuccess,
} from 'contexts/analytics/authUtil';
import { captureException } from '@sentry/nextjs';
import useCreateNonce from '../mutations/useCreateNonce';
import useLoginOrRedirectToOnboarding from '../mutations/useLoginOrRedirectToOnboarding';
import { getUserFriendlyWalletName } from 'utils/wallet';
import { useAccount, useSigner } from 'wagmi';
import { Signer } from 'ethers';

type Props = {
  walletName: WalletName;
  setDetectedError: (error: Web3Error) => void;
};

export function MultichainAuthenticateWallet({ walletName, setDetectedError }: Props) {
  const userFriendlyWalletName = getUserFriendlyWalletName(walletName?.description ?? '');
  const { address: account } = useAccount();
  const { data: signer } = useSigner();

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
    async (address: string, signer: Signer) => {
      setPendingState(PROMPT_SIGNATURE);
      trackSignInAttempt(userFriendlyWalletName);

      const { nonce, user_exists: userExists } = await createNonce(address);

      const signature = await signer.signMessage(nonce);

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
      loginOrRedirectToOnboarding,
      trackSignInSuccess,
      handleLogin,
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
      <div>
        <TitleS>Connect with {userFriendlyWalletName ?? 'your wallet'}</TitleS>
        <Spacer height={8} />
        <BaseM>Sign the message with your wallet.</BaseM>
      </div>
    );
  }

  return (
    <div>
      <TitleS>Connect with {userFriendlyWalletName ?? 'your wallet'}</TitleS>
      <Spacer height={8} />
      <BaseM>Approve your wallet to connect to Gallery.</BaseM>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import styled from 'styled-components';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { isWeb3Error, Web3Error } from 'types/Error';
import { INITIAL, PROMPT_SIGNATURE, PendingState } from 'types/Wallet';
import Spacer from 'components/core/Spacer/Spacer';
import { signMessageWithEOA } from '../walletUtils';
import {
  useTrackCreateUserSuccess,
  useTrackSignInAttempt,
  useTrackSignInError,
  useTrackSignInSuccess,
} from 'contexts/analytics/authUtil';
import { captureException } from '@sentry/nextjs';
import useCreateNonce from '../mutations/useCreateNonce';
import useLoginOrCreateUser from '../mutations/useLoginOrCreateUser';

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

  const { setLoggedIn } = useAuthActions();

  const createNonce = useCreateNonce();
  const loginOrCreateUser = useLoginOrCreateUser();

  const trackSignInAttempt = useTrackSignInAttempt();
  const trackSignInSuccess = useTrackSignInSuccess();
  const trackSignInError = useTrackSignInError();
  const trackCreateUserSuccess = useTrackCreateUserSuccess(userFriendlyWalletName);

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

      const { nonce, user_exists: userExists } = await createNonce(address);

      const signature = await signMessageWithEOA(address, nonce, signer, pendingWallet);

      const { userId } = await loginOrCreateUser({
        userExists,
        variables: { mechanism: { ethereumEoa: { address, nonce, signature } } },
      });

      if (userExists) {
        trackSignInSuccess(userFriendlyWalletName);
      } else {
        trackCreateUserSuccess();
      }

      setLoggedIn(userId, address);
    },
    [
      trackSignInAttempt,
      userFriendlyWalletName,
      createNonce,
      pendingWallet,
      loginOrCreateUser,
      setLoggedIn,
      trackSignInSuccess,
      trackCreateUserSuccess,
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
            captureException(error.message);
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
      <StyledAuthenticateWalletPending>
        <TitleS>Connect with {userFriendlyWalletName}</TitleS>
        <Spacer height={8} />
        <BaseM>Sign the message with your wallet.</BaseM>
      </StyledAuthenticateWalletPending>
    );
  }

  return (
    <StyledAuthenticateWalletPending>
      <TitleS>Connect with {userFriendlyWalletName}</TitleS>
      <Spacer height={8} />
      <BaseM>Approve your wallet to connect to Gallery.</BaseM>
    </StyledAuthenticateWalletPending>
  );
}

const StyledAuthenticateWalletPending = styled.div``;

export default AuthenticateWalletPendingDefault;

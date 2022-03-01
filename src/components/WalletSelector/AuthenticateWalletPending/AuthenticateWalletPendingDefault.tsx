import { useCallback, useEffect, useMemo, useState } from 'react';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import styled from 'styled-components';
import colors from 'components/core/colors';
import { BodyRegular, TitleMedium } from 'components/core/Text/Text';
import { useAuthActions } from 'contexts/auth/AuthContext';
import useFetcher from 'contexts/swr/useFetcher';
import { isWeb3Error, Web3Error } from 'types/Error';
import { INITIAL, PROMPT_SIGNATURE, PendingState } from 'types/Wallet';
import Spacer from 'components/core/Spacer/Spacer';
import { fetchNonce, loginOrCreateUser } from '../authRequestUtils';
import { signMessageWithEOA } from '../walletUtils';
import {
  useTrackCreateUserSuccess,
  useTrackSignInAttempt,
  useTrackSignInError,
  useTrackSignInSuccess,
} from 'contexts/analytics/authUtil';

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

  const fetcher = useFetcher();
  const { setLoggedIn } = useAuthActions();

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

      const { nonce, user_exists: userExists } = await fetchNonce(address, fetcher);

      const signature = await signMessageWithEOA(address, nonce, signer, pendingWallet);

      const payload = {
        signature,
        address,
        wallet_type: 0,
        nonce,
      };

      await loginOrCreateUser(userExists, payload, fetcher, trackCreateUserSuccess);
      trackSignInSuccess(userFriendlyWalletName);
      setLoggedIn(address);
    },
    [
      trackSignInAttempt,
      userFriendlyWalletName,
      fetcher,
      pendingWallet,
      trackSignInSuccess,
      setLoggedIn,
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
            setDetectedError(error);
          }

          // Fall back to generic error message
          if (error instanceof Error) {
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
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={8} />
        <BodyRegular color={colors.gray50}>Sign the message with your wallet.</BodyRegular>
      </StyledAuthenticateWalletPending>
    );
  }

  return (
    <StyledAuthenticateWalletPending>
      <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
      <Spacer height={8} />
      <BodyRegular color={colors.gray50}>Approve your wallet to connect to Gallery.</BodyRegular>
    </StyledAuthenticateWalletPending>
  );
}

const StyledAuthenticateWalletPending = styled.div``;

export default AuthenticateWalletPendingDefault;

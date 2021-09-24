import { useCallback, useEffect, useMemo, useState } from 'react';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import styled from 'styled-components';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import { BodyRegular, TitleMedium } from 'components/core/Text/Text';
import { useAuthActions } from 'contexts/auth/AuthContext';
import useFetcher from 'contexts/swr/useFetcher';
import { isWeb3Error, Web3Error } from 'types/Error';
import Spacer from 'components/core/Spacer/Spacer';
import { INITIAL, CONFIRM_ADDRESS, PROMPT_SIGNATURE } from 'types/Wallet';
import initializeAuthPipeline from './authRequestUtils';

type Props = {
  pendingWalletName: string;
  pendingWallet: AbstractConnector;
  setDetectedError: (error: Web3Error) => void;
};

type PendingState = typeof INITIAL | typeof CONFIRM_ADDRESS | typeof PROMPT_SIGNATURE;

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
function AuthenticateWalletPending({ pendingWallet, pendingWalletName, setDetectedError }: Props) {
  const {
    library,
    account,
  } = useWeb3React<Web3Provider>();
  const signer = useMemo(() => library && account ? library.getSigner(account) : undefined, [library, account]);

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);

  const fetcher = useFetcher();
  const { logIn } = useAuthActions();

  const attemptAuthentication = useCallback(async (address: string, signer: JsonRpcSigner) => {
    setPendingState(PROMPT_SIGNATURE);
    const { jwt, userId } = await initializeAuthPipeline({
      address,
      signer,
      fetcher,
      connector: pendingWallet,
    });
      // Mixpanel.trackConnectWallet(pendingWalletName);
    logIn({ jwt, userId });
  }, [fetcher, logIn, pendingWallet]);

  useEffect(() => {
    async function authenticate() {
      if (account && signer) {
        try {
          await attemptAuthentication(account.toLowerCase(), signer);
        } catch (error: unknown) {
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
  }, [account, signer, setDetectedError, attemptAuthentication]);

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <StyledAuthenticateWalletPending>
        <StyledTitleMedium>Connect with {pendingWalletName}</StyledTitleMedium>
        <BodyRegular color={colors.gray50}>Sign the message with your wallet.</BodyRegular>
      </StyledAuthenticateWalletPending>
    );
  }

  return (
    <StyledAuthenticateWalletPending>
      <StyledTitleMedium>Connect with {pendingWalletName}</StyledTitleMedium>
      <BodyRegular color={colors.gray50}>Approve your wallet to connect to Gallery.</BodyRegular>
    </StyledAuthenticateWalletPending>
  );
}

const StyledTitleMedium = styled(TitleMedium)`
  line-height: initial;
  font-size: 18px;

  margin-bottom: 16px;
`;

const StyledAuthenticateWalletPending = styled.div`
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
  padding: 16px;
  width: 100%;
  height: 100%;
`;

export default AuthenticateWalletPending;

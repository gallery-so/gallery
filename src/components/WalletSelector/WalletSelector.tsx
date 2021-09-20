import { Web3Provider } from '@ethersproject/providers';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from 'connectors/index';
// Import {  walletlink } from 'connectors/index';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthActions } from 'contexts/auth/AuthContext';
import colors from 'components/core/colors';
import { TitleMedium, BodyRegular, Caption } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import useFetcher from 'contexts/swr/useFetcher';
import Mixpanel from 'utils/mixpanel';
import { isWeb3Error } from 'types/Error';
import initializeAuthPipeline from './authRequestUtils';
import WalletButton from './WalletButton';

const walletConnectorMap: Record<string, AbstractConnector> = {
  Metamask: injected,
  WalletConnect: walletconnect,
  // TODO: enable wallet link once signature decoding is supported
  // WalletLink: walletlink,
};

type ErrorCode = string;
type Web3Error = Error & { code: ErrorCode };
type ErrorMessage = {
  heading: string;
  body: string;
};

// TODO: consider making these enums
const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  // Client-side provider errors: https://eips.ethereum.org/EIPS/eip-1193#provider-errors
  4001: {
    heading: 'Authorization denied',
    body: 'Please approve your wallet to connect to Gallery.',
  },
  UNSUPPORTED_CHAIN: {
    heading: 'Authorization error',
    body: 'The selected chain is unsupported. Please check your wallet.',
  },
  REJECTED_SIGNATURE: {
    heading: 'Signature required',
    body: 'Please sign the message with your wallet to log in.',
  },
  UNKNOWN_ERROR: {
    heading: 'There was an error connecting',
    body: 'Please try again.',
  },
};

function getErrorMessage(errorCode: string) {
  return ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}

function WalletSelector() {
  const {
    library,
    account,
    activate,
    deactivate,
    // Error returned from web3 provider
    error,
    setError,
  } = useWeb3React<Web3Provider>();

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector>();
  const [isPending, setIsPending] = useState(false);
  const [pendingWalletName, setPendingWalletName] = useState('');

  // Manually detected error not provided by web3 provider;
  // we need to set this on state ourselves
  const [detectedError, setDetectedError] = useState<Web3Error>();

  // Default to error displayed by web3 provider and fall back
  // to manually set error. since not all errors come with an
  // error code, we'll add them as they come up case-by-case
  const displayedError = useMemo(() => {
    const errorToDisplay = (error as Web3Error | undefined) ?? detectedError;
    if (!errorToDisplay) {
      return null;
    }

    // Handle error from server
    if (errorToDisplay.code === 'GALLERY_SERVER_ERROR') {
      return {
        heading: 'Authorization error',
        body: errorToDisplay.message,
      };
    }

    // Handle error from web3 lib
    if (!errorToDisplay.code) {
      // Manually handle error cases as we run into them with wallets
      if (errorToDisplay.name === 'UserRejectedRequestError') {
        errorToDisplay.code = '4001';
      }

      if (errorToDisplay.name === 'UnsupportedChainIdError') {
        errorToDisplay.code = 'UNSUPPORTED_CHAIN';
      }
    }

    return getErrorMessage(errorToDisplay.code ?? '');
  }, [error, detectedError]);

  const setToPendingState = useCallback(
    (connector: AbstractConnector, walletName: string) => {
      setIsPending(true);
      setPendingWallet(connector);
      setPendingWalletName(walletName);
    },
    [],
  );

  const retryConnectWallet = useCallback(() => {
    setIsPending(false);
    setDetectedError(undefined);
    deactivate();
  }, [deactivate]);

  const signer = useMemo(() => library && account ? library.getSigner(account) : undefined, [library, account]);

  const { logIn } = useAuthActions();

  const fetcher = useFetcher();

  useEffect(() => {
    async function authenticate() {
      // TODO: when hooking up to the server, make sure this only runs a single time
      if (account && isPending && signer && pendingWallet) {
        try {
          const { jwt, userId } = await initializeAuthPipeline({
            address: account.toLowerCase(),
            signer,
            fetcher,
            connector: pendingWallet,
          });
          Mixpanel.trackConnectWallet(pendingWalletName);
          logIn({ jwt, userId });
        } catch (error: unknown) {
          if (isWeb3Error(error)) {
            setDetectedError(error);
          }

          // Fall back to generic error message
          if (error instanceof Error) {
            const web3Error: Web3Error = { code: 'AUTHENTICATION_ERROR', ...error };
            setDetectedError(web3Error);
          }

          setIsPending(false);
        }
      }
    }

    void authenticate();
  }, [account, isPending, logIn, signer, fetcher, pendingWalletName, pendingWallet]);

  /**
   * Ensures screen does not retain an error message when it remounts. Since Web3
   * library errors are stored in the Web3Provider, they remain cached and continue
   * to stick around if the user navigates away and comes back (or closes a modal
   * and re-opens it).
   */
  useEffect(() =>
    () => {
      // This is the only way to clear the error from the provider
      // manually, but the library doesn't give us the option to pass in a non-error
      // @ts-expect-error: see comment
      setError(undefined);
    }
  , [setError]);

  if (displayedError) {
    return (
      <StyledWalletSelector>
        <StyledTitleMedium>{displayedError.heading}</StyledTitleMedium>
        <StyledBody color={colors.gray50}>{displayedError.body}</StyledBody>
        <StyledRetryButton onClick={retryConnectWallet} text="Retry" />
      </StyledWalletSelector>
    );
  }

  return (
    <StyledWalletSelector>
      <StyledTitleMedium>Connect your wallet</StyledTitleMedium>
      {isPending ? (
        <WalletButton
          activate={activate}
          connector={pendingWallet}
          setToPendingState={setToPendingState}
          isPending={isPending}
        />
      ) : (
        Object.keys(walletConnectorMap).map(walletName => (
          <WalletButton
            key={walletName}
            walletName={walletName}
            activate={activate}
            connector={walletConnectorMap[walletName]}
            setToPendingState={setToPendingState}
            isPending={isPending}
          />
        ))
      )}
      <Caption color={colors.gray50}>More wallets coming soon™</Caption>
    </StyledWalletSelector>
  );
}

const StyledWalletSelector = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
`;

const StyledTitleMedium = styled(TitleMedium)`
  line-height: initial;
  font-size: 18px;

  margin-bottom: 16px;
`;

const StyledBody = styled(BodyRegular)`
  margin-bottom: 30px;
`;

const StyledRetryButton = styled(Button)`
  width: 50%;
  align-self: center;
`;

export default WalletSelector;

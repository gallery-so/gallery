import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect, walletlink } from 'connectors/index';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useCallback, useMemo, useState } from 'react';
import colors from 'components/core/colors';
import { BodyRegular, Caption, BodyMedium, TitleMedium } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY } from 'types/Wallet';
import { convertWalletName } from 'utils/wallet';
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import breakpoints from 'components/core/breakpoints';
import WalletButton from './WalletButton';
import AuthenticateWalletPending from './AuthenticateWalletPending';
import AddWalletPending from './AddWalletPending';

const walletConnectorMap: Record<string, AbstractConnector> = {
  Metamask: injected,
  WalletConnect: walletconnect,
  WalletLink: walletlink,
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
    body: 'The selected chain is unsupported. We currently only support the Ethereum network.',
  },
  REJECTED_SIGNATURE: {
    heading: 'Signature required',
    body: 'Please sign the message with your wallet to log in.',
  },
  USER_SIGNUP_DISABLED: {
    heading: 'Coming Soon',
    body: 'We\'ve detected a Gallery Member Card in your wallet! You\'ll be able to use it to create an account with us soon.\n\n For further updates, find us on Twitter or join our Discord.',
  },
  EXISTING_USER: {
    heading: 'This address is already associated with an existing user.',
    body: 'Sign in with that address',
  },
  UNKNOWN_ERROR: {
    heading: 'There was an error connecting',
    body: 'Please try again.',
  },
};

function getErrorMessage(errorCode: string) {
  return ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}

// AUTH: authenticate with wallet (sign in)
// ADD_WALLET_TO_USER: add wallet to user
// CONNECT_WALLET: simple connect (no sign in) used to allow non-users to mint

type ConnectionMode = typeof AUTH | typeof ADD_WALLET_TO_USER | typeof CONNECT_WALLET_ONLY;

type Props = {
  connectionMode?: ConnectionMode;
};

function WalletSelector({ connectionMode = AUTH }: Props) {
  const {
    activate,
    deactivate,
    error,
  } = useWeb3React<Web3Provider>();

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector>();
  const [isPending, setIsPending] = useState(false);
  const [pendingWalletName, setPendingWalletName] = useState('');

  const userFriendlyWalletName = useMemo(() => convertWalletName(pendingWalletName), [pendingWalletName]);

  // Manually detected error not provided by web3 provider;
  // we need to set this on state ourselves
  const [detectedError, setDetectedError] = useState<Web3Error>();

  // Default to error displayed by web3 provider and fall back
  // to manually set error. since not all errors come with an
  // error code, we'll add them as they come up case-by-case
  const displayedError = useMemo(() => {
    const errorToDisplay = (error as Web3Error | undefined) ?? detectedError;
    console.log(error, detectedError);
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

  if (displayedError) {
    return (
      <StyledWalletSelector>
        <BodyMedium>{displayedError.heading}</BodyMedium>
        <Spacer height={16} />
        <StyledBody color={colors.gray50}>{displayedError.body}</StyledBody>
        <StyledRetryButton onClick={retryConnectWallet} text="Retry" />
      </StyledWalletSelector>
    );
  }

  if (isPending && pendingWallet) {
    if (connectionMode === ADD_WALLET_TO_USER) {
      return (
        <StyledWalletSelector>
          <AddWalletPending
            setDetectedError={setDetectedError}
            pendingWallet={pendingWallet}
            userFriendlyWalletName={userFriendlyWalletName}
          />
        </StyledWalletSelector>
      );
    }

    if (connectionMode === CONNECT_WALLET_ONLY) {
      return (
        <StyledWalletSelector>
          <div>
            <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
            <Spacer height={8}/>
            <BodyRegular color={colors.gray50}>Approve your wallet to connect to Gallery.</BodyRegular>
          </div>
        </StyledWalletSelector>
      );
    }

    if (connectionMode === AUTH) {
      return (
        <StyledWalletSelector>
          <AuthenticateWalletPending
            setDetectedError={setDetectedError}
            pendingWallet={pendingWallet}
            userFriendlyWalletName={userFriendlyWalletName}
          />
        </StyledWalletSelector>
      );
    }
  }

  return (
    <StyledWalletSelector>
      <StyledBodyMedium>Connect your wallet</StyledBodyMedium>
      <Spacer height={16} />
      {Object.keys(walletConnectorMap).map(walletName => (
        <WalletButton
          key={walletName}
          walletName={walletName}
          activate={activate}
          connector={walletConnectorMap[walletName]}
          setToPendingState={setToPendingState}
          isPending={isPending}
        />
      ))
      }
      <Spacer height={8}/>
      <Caption color={colors.gray50}>More wallets coming soon™</Caption>
    </StyledWalletSelector>
  );
}

const StyledWalletSelector = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  width: 70vw;

  @media only screen and ${breakpoints.tablet} {
    width: 400px;
    max-width: 480px;
  }
`;

const StyledBodyMedium = styled(BodyMedium)`
  text-align: left;
`;

const StyledBody = styled(BodyRegular)`
  margin-bottom: 30px;
  white-space: pre-wrap;
`;

const StyledRetryButton = styled(Button)`
  width: 50%;
  align-self: center;
`;

export default WalletSelector;

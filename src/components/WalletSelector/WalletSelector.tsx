import styled from 'styled-components';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { injected, walletconnect, walletlink } from 'connectors/index';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useCallback, useMemo, useState } from 'react';
import { BaseM, TitleS } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY, WalletName } from 'types/Wallet';
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import breakpoints from 'components/core/breakpoints';
import { UserRejectedRequestError } from '@web3-react/injected-connector';
import WalletButton from './WalletButton';
import AuthenticateWalletPending from './AuthenticateWalletPending/AuthenticateWalletPending';
import AddWalletPending from './AddWalletPending/AddWalletPending';
import Markdown from 'components/core/Markdown/Markdown';
import { getUserFriendlyWalletName } from 'utils/wallet';
import { graphql, useFragment } from 'react-relay';
import { WalletSelectorFragment$key } from '__generated__/WalletSelectorFragment.graphql';
import { isNotEarlyAccessError } from 'contexts/analytics/authUtil';

const walletConnectorMap: Record<string, AbstractConnector> = {
  Metamask: injected,
  WalletConnect: walletconnect,
  WalletLink: walletlink,
  GnosisSafe: walletconnect,
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
    body: "We've detected a Gallery Member Card in your wallet! You'll be able to use it to create an account with us soon.\n\n For further updates, find us on Twitter or join our Discord.",
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
  queryRef: WalletSelectorFragment$key;
};

function WalletSelector({ connectionMode = AUTH, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment WalletSelectorFragment on Query {
        ...AddWalletPendingFragment
      }
    `,
    queryRef
  );

  const { activate, deactivate, error, account } = useWeb3React<Web3Provider>();

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector>();
  const [isPending, setIsPending] = useState(false);
  const [pendingWalletName, setPendingWalletName] = useState<WalletName>();

  const userFriendlyWalletName = useMemo(
    () => getUserFriendlyWalletName(pendingWalletName?.description ?? ''),
    [pendingWalletName]
  );

  // Manually detected error not provided by web3 provider;
  // we need to set this on state ourselves
  const [detectedError, setDetectedError] = useState<Web3Error>();

  // Default to error displayed by web3 provider and fall back
  // to manually set error. since not all errors come with an
  // error code, we'll add them as they come up case-by-case
  const displayedError = useMemo(() => {
    // error is an error from the web3 provider
    if (error) {
      if (error instanceof UnsupportedChainIdError) {
        return getErrorMessage('UNSUPPORTED_CHAIN');
      }

      if (error instanceof UserRejectedRequestError) {
        return getErrorMessage('REJECTED_SIGNATURE');
      }

      return getErrorMessage('UNKNOWN_ERROR');
    }

    // detectedError is an error we manually set elsewhere in the app
    if (detectedError) {
      // Handle error from server
      if (detectedError.code === 'GALLERY_SERVER_ERROR') {
        if (isNotEarlyAccessError(detectedError.message)) {
          return {
            heading: account?.toLowerCase(),
            body: 'Your wallet address is not on the **Early Access Allowlist**. To get onto the allowlist, visit our [FAQ](https://gallery-so.notion.site/Gallery-FAQ-b5ee57c1d7f74c6695e42c84cb6964ba#6fa1bc2983614500a206fc14fcfd61bf) or reach out to us on [Discord](discord.gg/vBqBEH8GaM).',
          };
        }

        return {
          heading: 'Authorization error',
          body: detectedError.message,
        };
      }

      return getErrorMessage(detectedError.code);
    }

    return null;
  }, [error, detectedError, account]);

  const availableWalletOptions = useMemo(() => {
    if (connectionMode === CONNECT_WALLET_ONLY) {
      return ['Metamask', 'WalletConnect', 'WalletLink'];
    }

    return ['Metamask', 'WalletConnect', 'WalletLink', 'GnosisSafe'];
  }, [connectionMode]);

  const setToPendingState = useCallback((connector: AbstractConnector, walletName: WalletName) => {
    setIsPending(true);
    setPendingWallet(connector);
    setPendingWalletName(walletName);
  }, []);

  const retryConnectWallet = useCallback(() => {
    setIsPending(false);
    setDetectedError(undefined);
    deactivate();
  }, [deactivate]);

  if (displayedError) {
    return (
      <StyledWalletSelector>
        <TitleS>{displayedError.heading}</TitleS>
        <Spacer height={16} />
        <StyledBody>
          <Markdown text={displayedError.body} />
        </StyledBody>
        <StyledRetryButton onClick={retryConnectWallet} text="Try Another Wallet" />
      </StyledWalletSelector>
    );
  }

  if (isPending && pendingWallet && pendingWalletName) {
    if (connectionMode === ADD_WALLET_TO_USER) {
      return (
        <StyledWalletSelector>
          <AddWalletPending
            queryRef={query}
            setDetectedError={setDetectedError}
            pendingWallet={pendingWallet}
            userFriendlyWalletName={userFriendlyWalletName}
            walletName={pendingWalletName}
          />
        </StyledWalletSelector>
      );
    }

    if (connectionMode === CONNECT_WALLET_ONLY) {
      return (
        <StyledWalletSelector>
          <div>
            <TitleS>Connect with {userFriendlyWalletName}</TitleS>
            <Spacer height={8} />
            <BaseM>Approve your wallet to connect to Gallery.</BaseM>
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
            walletName={pendingWalletName}
          />
        </StyledWalletSelector>
      );
    }
  }

  return (
    <StyledWalletSelector>
      <Spacer height={16} />
      <StyledTitleS>Connect your wallet</StyledTitleS>
      <Spacer height={16} />
      {availableWalletOptions.map((walletName) => (
        <WalletButton
          key={walletName}
          walletName={walletName}
          activate={activate}
          connector={walletConnectorMap[walletName]}
          setToPendingState={setToPendingState}
        />
      ))}
      <Spacer height={8} />
      <BaseM>More wallets coming soon™</BaseM>
    </StyledWalletSelector>
  );
}

const StyledWalletSelector = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  width: 320px;
  justify-content: center;

  @media only screen and ${breakpoints.mobileLarge} {
    width: 400px;
    max-width: 480px;
  }
`;

const StyledTitleS = styled(TitleS)`
  text-align: left;
`;

const StyledBody = styled(BaseM)`
  margin-bottom: 30px;
  white-space: pre-wrap;
`;

const StyledRetryButton = styled(Button)`
  width: 50%;
  align-self: center;
`;

export default WalletSelector;

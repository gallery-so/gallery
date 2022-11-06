import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { UserRejectedRequestError } from '@web3-react/injected-connector';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import Markdown from '~/components/core/Markdown/Markdown';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import { injected, walletconnect, walletlink } from '~/connectors/index';
import { isNotEarlyAccessError } from '~/contexts/analytics/authUtil';
import { DeprecatedWalletSelectorFragment$key } from '~/generated/DeprecatedWalletSelectorFragment.graphql';
import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY, WalletName } from '~/types/Wallet';
import { getUserFriendlyWalletName } from '~/utils/wallet';

import AddWalletPending from './AddWalletPending/AddWalletPending';
import AuthenticateWalletPending from './AuthenticateWalletPending/AuthenticateWalletPending';
import WalletButton from './WalletButton';
import { ConnectionMode } from './WalletSelector';

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
    heading: 'Signature rejected',
    body: 'The signature was rejected. Try again or use another wallet.',
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

type Props = {
  connectionMode?: ConnectionMode;
  queryRef: DeprecatedWalletSelectorFragment$key;
};

export default function DeprecatedWalletSelector({ connectionMode = AUTH, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment DeprecatedWalletSelectorFragment on Query {
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

  const handleSwitchNetwork = useCallback(async () => {
    const provider = await injected.getProvider();
    provider.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: '0x1', // Mainnet
        },
      ],
    });
  }, []);

  if (displayedError) {
    return (
      <StyledWalletSelector>
        <VStack gap={16}>
          <TitleS>{displayedError.heading}</TitleS>
          <StyledBody>
            <Markdown text={displayedError.body} />
          </StyledBody>
        </VStack>
        {error instanceof UnsupportedChainIdError ? (
          <StyledRetryButton onClick={handleSwitchNetwork}>Switch Network</StyledRetryButton>
        ) : (
          <StyledRetryButton onClick={retryConnectWallet}>Try Another Wallet</StyledRetryButton>
        )}
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
          <VStack gap={8}>
            <TitleS>Connect with {userFriendlyWalletName}</TitleS>
            <BaseM>Approve your wallet to connect to Gallery.</BaseM>
          </VStack>
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
    <StyledWalletSelector gap={16}>
      <VStack>
        {availableWalletOptions.map((walletName) => (
          <WalletButton
            key={walletName}
            walletName={walletName}
            activate={activate}
            connector={walletConnectorMap[walletName]}
            setToPendingState={setToPendingState}
          />
        ))}
      </VStack>
      <BaseM>More chains coming soon™</BaseM>
    </StyledWalletSelector>
  );
}

const StyledWalletSelector = styled(VStack)`
  text-align: center;
  width: 320px;
  justify-content: center;
  padding-top: 16px;

  @media only screen and ${breakpoints.mobileLarge} {
    width: 400px;
    max-width: 480px;
  }
`;

const StyledBody = styled(BaseM)`
  margin-bottom: 30px;
  white-space: pre-wrap;
`;

const StyledRetryButton = styled(Button)`
  width: 200px;
  align-self: center;
`;

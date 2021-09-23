import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Web3ReactManagerFunctions } from '@web3-react/core/dist/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { injected } from 'connectors/index';
import Loader from 'components/core/Loader/Loader';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';

import metamaskIcon from 'assets/icons/metamask.svg';
import walletConnectIcon from 'assets/icons/walletconnect.svg';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

const walletIconMap: Record<string, string> = {
  metamask: metamaskIcon,
  walletconnect: walletConnectIcon,
};

type WalletButtonProps = {
  walletName?: string;
  activate: Web3ReactManagerFunctions['activate'];
  deactivate: Web3ReactManagerFunctions['deactivate'];
  connector?: AbstractConnector;
  setToPendingState: (connector: AbstractConnector, walletName: string) => void;
  isPending: boolean;
};

function WalletButton({
  walletName,
  activate,
  connector,
  setToPendingState,
  isPending,
  deactivate,
}: WalletButtonProps) {
  const handleClick = useCallback(() => {
    if (connector && walletName) {
      window.localStorage.removeItem('walletconnect');
      setToPendingState(connector, walletName);
      // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
        connector.walletConnectProvider = undefined;
      }

      void activate(connector);
    }
  }, [activate, connector, setToPendingState, walletName]);

  const loadingView = useMemo(() => (
    <>
      {'Connecting...'}
      <Loader thicc size="medium" />
    </>
  ), []);

  const iconView = useMemo(() => {
    if (!walletName) {
      return null;
    }

    return (
      <>
        {walletName}
        <Icon
          src={walletIconMap[walletName.toLowerCase()]}
        />
      </>
    );
  }, [walletName]);

  // Injected is the connector type used for browser wallet extensions/dApp browsers
  if (connector === injected // Metamask injects a global API at window.ethereum (web3 for legacy) if it is installed
    && !(window.web3 || window.ethereum) && walletName && walletName.toLowerCase() === 'metamask') {
    return (
      <StyledExternalLink href="https://metamask.io/" target="_blank">
        <StyledButton data-testid="wallet-button">
          {'Install Metamask'}
          <Icon
            src={metamaskIcon}
          />
        </StyledButton>
      </StyledExternalLink>
    );
  }

  return (
    <StyledButton
      data-testid="wallet-button"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? loadingView : iconView}
    </StyledButton>
  );
}

type StyledButtonProps = {
  isPending?: boolean;
};

const Icon = styled.img`
  width: 30px;
  height: 30px;
  margin: 5px;

  transform: scale(1);
  transition: transform ${transitions.cubic};
`;

const StyledButton = styled.button<StyledButtonProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  background: white;
  border: 1px solid ${colors.gray50};
  padding: 12px 16px;
  margin: 10px 0;
  width: 356px;
  height: 68px;
  font-size: 16px;

  cursor: pointer;
  :disabled {
    border-color: ${colors.gray50};
  }
  &:hover {
    border-color: ${colors.black};

    ${Icon} {
      transform: scale(1.15);
    }
  }
  transition: border-color ${transitions.cubic};
`;

const StyledExternalLink = styled.a`
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    text-decoration-color: ${colors.gray50};
  }
`;

export default WalletButton;

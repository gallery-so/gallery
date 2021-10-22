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
import walletLinkIcon from 'assets/icons/walletlink.svg';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { BodyRegular } from 'components/core/Text/Text';
import { convertWalletName } from 'utils/wallet';

const walletIconMap: Record<string, string> = {
  metamask: metamaskIcon,
  walletconnect: walletConnectIcon,
  walletlink: walletLinkIcon,
};

type WalletButtonProps = {
  walletName: string;
  activate: Web3ReactManagerFunctions['activate'];
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
}: WalletButtonProps) {
  const handleClick = useCallback(() => {
    if (connector) {
      if (connector instanceof WalletConnectConnector) {
        // Walletconnect "remembers" what address you recently connected with. We don't want this for multi-wallet
        window.localStorage.removeItem('walletconnect');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (connector.walletConnectProvider?.wc?.uri) {
          // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
          connector.walletConnectProvider = undefined;
        }
      }

      setToPendingState(connector, walletName);

      void activate(connector);
    }
  }, [activate, connector, setToPendingState, walletName]);

  const loadingView = useMemo(() => (
    <>
      <BodyRegular>Connecting...</BodyRegular>
      <Loader thicc size="medium" />
    </>
  ), []);

  const iconView = useMemo(() => (
    <>
      <BodyRegular>{convertWalletName(walletName)}</BodyRegular>
      <Icon src={walletIconMap[walletName.toLowerCase()]} />
    </>
  ), [walletName]);

  // Injected is the connector type used for browser wallet extensions/dApp browsers
  if (connector === injected // Metamask injects a global API at window.ethereum (web3 for legacy) if it is installed
    && !(window.web3 || window.ethereum) && walletName.toLowerCase() === 'metamask') {
    return (
      <StyledExternalLink href="https://metamask.io/" target="_blank">
        <StyledButton data-testid="wallet-button">
          <BodyRegular>Install Metamask</BodyRegular>
          <Icon src={metamaskIcon} />
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
  padding: 8px 16px;
  margin-bottom: 8px;
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
  display: flex;
  flex-direction: column;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    text-decoration-color: ${colors.gray50};
  }
`;

export default WalletButton;

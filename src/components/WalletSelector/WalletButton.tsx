import { AbstractConnector } from '@web3-react/abstract-connector';
import { Web3ReactManagerFunctions } from '@web3-react/core/dist/types';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { BaseM } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import { injected } from '~/connectors/index';
import { GNOSIS_SAFE, METAMASK, WALLETCONNECT, WALLETLINK, WalletName } from '~/types/Wallet';
import { getUserFriendlyWalletName } from '~/utils/wallet';

const walletIconMap: Record<string, string> = {
  metamask: '/icons/metamask.svg',
  walletconnect: '/icons/walletconnect.svg',
  walletlink: '/icons/walletlink.svg',
  gnosis_safe: '/icons/gnosis_safe.svg',
};

const walletNameSymbolMap: Record<string, WalletName> = {
  Metamask: METAMASK,
  WalletConnect: WALLETCONNECT,
  WalletLink: WALLETLINK,
  GnosisSafe: GNOSIS_SAFE,
};

type WalletButtonProps = {
  walletName: string;
  activate: Web3ReactManagerFunctions['activate'];
  connector?: AbstractConnector;
  setToPendingState: (connector: AbstractConnector, walletName: WalletName) => void;
};

function WalletButton({ walletName, activate, connector, setToPendingState }: WalletButtonProps) {
  const walletSymbol = useMemo(() => walletNameSymbolMap[walletName], [walletName]);

  const handleClick = useCallback(() => {
    if (connector) {
      if (connector instanceof WalletConnectConnector) {
        // Walletconnect "remembers" what address you recently connected with. We don't want this for multi-wallet.
        // if the connector is walletconnect and the user has already tried to connect, manually reset the connector.
        connector.walletConnectProvider = undefined;
        window.localStorage.removeItem('walletconnect');
      }

      setToPendingState(connector, walletSymbol);

      void activate(connector);
    }
  }, [activate, connector, setToPendingState, walletSymbol]);

  const userFriendlyWalletName = useMemo(
    () => getUserFriendlyWalletName(walletSymbol?.description ?? ''),
    [walletSymbol]
  );

  const iconView = useMemo(
    () => (
      <>
        <BaseM>{userFriendlyWalletName}</BaseM>
        <Icon src={walletIconMap[(walletSymbol?.description ?? '').toLowerCase()]} />
      </>
    ),
    [userFriendlyWalletName, walletSymbol?.description]
  );

  // Injected is the connector type used for browser wallet extensions/dApp browsers
  if (
    connector === injected && // Metamask injects a global API at window.ethereum (web3 for legacy) if it is installed
    !(window.web3 || window.ethereum) &&
    walletSymbol === METAMASK
  ) {
    return (
      <StyledExternalLink href="https://metamask.io/" target="_blank">
        <StyledButton data-testid="wallet-button">
          <BaseM>Install Metamask</BaseM>
          <Icon src="/icons/metamask.svg" />
        </StyledButton>
      </StyledExternalLink>
    );
  }

  return (
    <StyledButton data-testid="wallet-button" onClick={handleClick}>
      {iconView}
    </StyledButton>
  );
}

const Icon = styled.img`
  width: 30px;
  height: 30px;
  margin: 5px;

  transform: scale(1);
  transition: transform ${transitions.cubic};
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;

  background: ${colors.white};
  border: 1px solid ${colors.metal};
  padding: 8px 16px;
  margin-bottom: 8px;
  font-size: 16px;

  cursor: pointer;
  :disabled {
    border-color: ${colors.metal};
  }
  &:hover {
    border-color: ${colors.offBlack};

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
    text-decoration-color: ${colors.metal};
  }
`;

export default WalletButton;

import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Web3ReactManagerFunctions } from '@web3-react/core/dist/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { injected } from 'connectors/index';
import Loader from 'components/core/Loader/Loader';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';

type WalletButtonProps = {
  walletName?: string;
  activate: Web3ReactManagerFunctions['activate'];
  connector?: AbstractConnector;
  setToPendingState: (connector: AbstractConnector) => void;
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
    if (walletName && walletName.toLowerCase() === 'metamask') {
      injected.isAuthorized().then((isAuthorized: boolean) => {
        // TODO: figure out what goes here
      });
    }
    if (connector) {
      setToPendingState(connector);
      activate(connector);
    }
  }, [activate, connector, setToPendingState, walletName]);

  const loadingView = useMemo(() => {
    return (
      <>
        {'Connecting...'}
        <Loader thicc size="medium" />
      </>
    );
  }, []);

  const iconView = useMemo(() => {
    if (!walletName) return null;

    return (
      <>
        {walletName}
        <Icon
          src={require(`assets/icons/${walletName.toLowerCase()}.svg`).default}
        />
      </>
    );
  }, [walletName]);

  // injected is the connector type used for browser wallet extensions/dApp browsers
  if (connector === injected) {
    // metamask injects a global API at window.ethereum (web3 for legacy) if it is installed
    if (!(window.web3 || window.ethereum)) {
      if (walletName && walletName.toLowerCase() === 'metamask') {
        return (
          <StyledExternalLink href="https://metamask.io/" target="_blank">
            <StyledButton data-testid="wallet-button">
              {'Install Metamask'}
              <Icon src={require('assets/icons/metamask.svg').default} />
            </StyledButton>
          </StyledExternalLink>
        );
      }
    }
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

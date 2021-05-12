import { Web3ReactManagerFunctions } from '@web3-react/core/dist/types';
import { injected } from 'connectors/index';
import { useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { AbstractConnector } from '@web3-react/abstract-connector';
import colors from 'components/core/colors';

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
        <StyledLoader />
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

// TODO: save this as a general transition under /core
const transitionStyle = `300ms cubic-bezier(0, 0, 0, 1.07)`;

const Icon = styled.img`
  width: 30px;
  height: 30px;
  margin: 5px;

  transform: scale(1);
  transition: transform ${transitionStyle};
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
  transition: border-color 0.2s;
`;

const StyledExternalLink = styled.a`
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    text-decoration-color: ${colors.gray50};
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const StyledLoader = styled.div`
  border: 4px solid ${colors.black}; /* Light grey */
  border-top: 4px solid ${colors.white}; /* Blue */
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: ${spin} 2s linear infinite;
`;

export default WalletButton;

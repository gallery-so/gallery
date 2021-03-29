import { Web3Provider } from '@ethersproject/providers';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { Web3ReactManagerFunctions } from '@web3-react/core/dist/types';
import { injected, walletconnect } from 'connectors/index';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useCallback } from 'react';

const walletConnectorMap: Record<string, AbstractConnector> = {
  Metamask: injected,
  WalletConnect: walletconnect,
};

function WalletSelector() {
  const context = useWeb3React<Web3Provider>();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = context;

  return (
    <StyledWalletSelector>
      <StyledHeader>Connect your wallet</StyledHeader>
      <div>
        {active && 'connected'}
        {error && `${error.message}`}
      </div>
      {active && <div>{account}</div>}
      {Object.keys(walletConnectorMap).map((walletName) => {
        return <WalletButton walletName={walletName} activate={activate} />;
      })}
    </StyledWalletSelector>
  );
}

type WalletButtonProps = {
  walletName: string;
  activate: Web3ReactManagerFunctions['activate'];
};

function WalletButton({ walletName, activate }: WalletButtonProps) {
  const handleClick = useCallback(() => {
    if (walletName.toLowerCase() === 'metamask') {
      injected.isAuthorized().then((isAuthorized: boolean) => {
        console.log('isAuthorized', isAuthorized);
      });
    }
    activate(walletConnectorMap[walletName]);
  }, [activate, walletName]);

  return (
    <StyledButton onClick={handleClick}>
      {walletName}
      <Icon src={`/icons/${walletName}.svg`}></Icon>
    </StyledButton>
  );
}

const StyledWalletSelector = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.p`
  color: black;
  font-size: 24px;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin: 5px;
`;

const StyledButton = styled.button`
  background: white;
  padding: 16px;
  border: 1px solid black;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 356px;
  margin: 10px 0;
  cursor: pointer;
`;

export default WalletSelector;

import { Web3Provider } from '@ethersproject/providers';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from 'connectors/index';
import { AbstractConnector } from '@web3-react/abstract-connector';

const walletConnectorMap: Record<string, AbstractConnector> = {
  metamask: injected,
  walletconnect: walletconnect,
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
      <div>
        {active && 'connected'}
        {error && `${error.message}`}
      </div>
      {active && <div>{account}</div>}
      {Object.keys(walletConnectorMap).map((walletName) => {
        return (
          <StyledButton
            onClick={() => {
              injected.isAuthorized().then((isAuthorized: boolean) => {
                console.log('isAuthorized', isAuthorized);
              });
              activate(walletConnectorMap[walletName]);
            }}
          >
            {walletName}
          </StyledButton>
        );
      })}
    </StyledWalletSelector>
  );
}

const StyledWalletSelector = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.p`
  color: white;
  font-size: 30px;
`;

const StyledButton = styled.button`
  background: white;
  padding: 20px;
  border: 1px solid black;
  font-size: 16px;
`;

export default WalletSelector;

import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { injected, walletconnect } from 'connectors/index';

function AuthDemo(_: RouteComponentProps) {
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
    <StyledAuthDemo>
      <StyledHeader>AuthDemo</StyledHeader>
      <div>
        {active && 'connected'}
        {error && `${error.message}`}
      </div>
      {active && <div>{account}</div>}
      <button
        onClick={() => {
          injected.isAuthorized().then((isAuthorized: boolean) => {
            console.log('isAuthorized', isAuthorized);
          });
          activate(injected);
        }}
      >
        Connect Metamask
      </button>
    </StyledAuthDemo>
  );
}

const StyledAuthDemo = styled.div`
  text-align: center;
`;

const StyledHeader = styled.p`
  color: white;
  font-size: 30px;
`;

export default memo(AuthDemo);

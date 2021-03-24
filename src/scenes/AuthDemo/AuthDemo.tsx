import { memo } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

function AuthDemo() {
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

import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { NETWORK_CONTEXT_NAME } from 'connectors/index';

export function useActiveWeb3React() {
  const context = useWeb3React<Web3Provider>();
  const contextNetwork = useWeb3React<Web3Provider>(NETWORK_CONTEXT_NAME);

  return context.active ? context : contextNetwork;
}

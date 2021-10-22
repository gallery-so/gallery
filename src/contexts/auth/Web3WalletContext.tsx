import { memo } from 'react';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { NETWORK_CONTEXT_NAME } from 'connectors/index';

function getLibrary(provider: any) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12_000;
  return library;
}

const Web3WalletProvider = memo(({ children }) => (
  <Web3ReactProvider getLibrary={getLibrary}>{children}</Web3ReactProvider>
));

const Web3ReactRoot = createWeb3ReactRoot(NETWORK_CONTEXT_NAME);

export const Web3ProviderNetwork = memo(({ children }) => (
  <Web3ReactRoot getLibrary={getLibrary}>{children}</Web3ReactRoot>
));

export default Web3WalletProvider;

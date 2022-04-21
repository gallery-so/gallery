import { memo, useState } from 'react';
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

let web3Root: ReturnType<typeof createWeb3ReactRoot>;

// Create the react root once and never update it.
// This is because Web3React does not work with SSR.
if (typeof window !== 'undefined') {
  web3Root = createWeb3ReactRoot(NETWORK_CONTEXT_NAME);
}

export const Web3ProviderNetwork = memo(({ children }) => {
  const [Web3ReactRoot] = useState(() => web3Root);

  return <Web3ReactRoot getLibrary={getLibrary}>{children}</Web3ReactRoot>;
});

export default Web3WalletProvider;

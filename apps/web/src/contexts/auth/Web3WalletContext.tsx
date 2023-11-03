import { Web3Provider } from '@ethersproject/providers';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { memo, PropsWithChildren, useState } from 'react';

import { NETWORK_CONTEXT_NAME } from '~/connectors/index';

// The library actually types this as any. I don't like it,
// but I don't know what else it should be.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLibrary(provider: any) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12_000;
  return library;
}

export const Web3WalletProvider = memo(({ children }: PropsWithChildren) => (
  <Web3ReactProvider getLibrary={getLibrary}>{children}</Web3ReactProvider>
));

Web3WalletProvider.displayName = 'Web3WalletProvider';

let web3Root: ReturnType<typeof createWeb3ReactRoot>;

// Create the react root once and never update it.
// This is because Web3React does not work with SSR.
if (typeof window !== 'undefined') {
  web3Root = createWeb3ReactRoot(NETWORK_CONTEXT_NAME);
}

export const Web3ProviderNetwork = memo(({ children }: PropsWithChildren) => {
  const [Web3ReactRoot] = useState(() => web3Root);

  return <Web3ReactRoot getLibrary={getLibrary}>{children}</Web3ReactRoot>;
});

Web3ProviderNetwork.displayName = 'Web3ProviderNetwork';

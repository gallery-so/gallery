import Home from 'scenes/Home/Home';
import AuthDemo from 'scenes/AuthDemo/AuthDemo';
import { SwrProvider } from 'contexts/swr/SwrContext';
import Boundary from 'contexts/boundary/Boundary';

import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

function getLibrary(provider: any) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

function App() {
  return (
    <Boundary>
      <Web3ReactProvider getLibrary={getLibrary}>
        <SwrProvider>
          <Home />
          <AuthDemo />
        </SwrProvider>
      </Web3ReactProvider>
    </Boundary>
  );
}

export default App;

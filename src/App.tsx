import { SwrProvider } from './contexts/swr/SwrContext';
import Home from './scenes/Home/Home';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

function App() {
  const context = useWeb3React<Web3Provider>();
  const { connector, library, chainId, account, activate, deactivate, active, error } = context;

  return (
    <SwrProvider>
      <Home />
    </SwrProvider>
  );
}

export default App;

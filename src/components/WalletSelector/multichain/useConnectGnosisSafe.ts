import { useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
// import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

export const useConnectGnosisSafe = () => {
  const { activate, connector } = useWeb3React<Web3Provider>();

  return useCallback(() => {
    if (!connector) {
      // TODO: error?
      return;
    }

    // if (connector instanceof WalletConnectConnector) {
    //   // Walletconnect "remembers" what address you recently connected with. We don't want this for multi-wallet.
    //   // if the connector is walletconnect and the user has already tried to connect, manually reset the connector.
    //   connector.walletConnectProvider = undefined;
    //   window.localStorage.removeItem('walletconnect');
    // }

    // setToPendingState(connector, walletSymbol);

    activate(connector);
  }, [activate, connector]);
};

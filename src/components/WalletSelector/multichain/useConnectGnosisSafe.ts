import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';

import { walletconnect } from '~/connectors/index';

export const useConnectGnosisSafe = () => {
  const { activate } = useWeb3React<Web3Provider>();

  return useCallback(async () => {
    // Walletconnect "remembers" what address you recently connected with. We don't want this for multi-wallet.
    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector.
    walletconnect.walletConnectProvider = undefined;
    window.localStorage.removeItem('walletconnect');

    await activate(walletconnect);
    const account = await walletconnect.getAccount();

    if (!account) {
      // TODO: structured error so we can render a custom message
      throw new Error('User closed WalletConnect modal before connecting');
    }

    return account;
  }, [activate]);
};

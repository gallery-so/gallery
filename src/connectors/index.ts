import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

const NETWORK_URL
  = 'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: NETWORK_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 150_000,
});

export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'gallery',
});

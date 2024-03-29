import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,
}

export const NETWORK_CONTEXT_NAME = 'NETWORK';

const NETWORK_URLS = {
  [SupportedChainId.MAINNET]: 'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213',
  [SupportedChainId.GOERLI]: 'https://goerli.infura.io/v3/84842078b09946638c03157f83405213',
};

const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.GOERLI,
];

export const network = new NetworkConnector({
  urls: NETWORK_URLS,
  defaultChainId: Number(process.env.NEXT_PUBLIC_NETWORK_CONNECTOR_CHAIN_ID ?? 1),
});

export const injected = new InjectedConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
});

export const walletconnect = new WalletConnectConnector({
  chainId: Number(process.env.NEXT_PUBLIC_NETWORK_CONNECTOR_CHAIN_ID ?? 1),
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
  rpc: NETWORK_URLS,
  qrcode: true,
});

export const walletlink = new WalletLinkConnector({
  url: NETWORK_URLS[SupportedChainId.MAINNET],
  appName: 'gallery',
});

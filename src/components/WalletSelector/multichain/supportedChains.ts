export type SupportedChainKey = 'ethereum';

export type SupportedChain = {
  name: string;
};

export const supportedChains: Readonly<Record<SupportedChainKey, Readonly<SupportedChain>>> = {
  ethereum: {
    name: 'Ethereum',
  },
};

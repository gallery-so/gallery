import keyBy from 'lodash.keyby';

export const chains = [
  {
    name: 'Ethereum',
    shortName: 'ETH',
    icon: '/icons/ethereum_logo.svg',
    baseChain: 'Ethereum',
    hasCreatorSupport: true,
    isEnabled: true,
  },
  {
    name: 'Tezos',
    shortName: 'TEZ',
    icon: '/icons/tezos_logo.svg',
    baseChain: 'Tezos',
    hasCreatorSupport: false,
    isEnabled: true,
  },
  {
    name: 'Optimism',
    shortName: 'OP',
    icon: '/icons/op_logo.svg',
    baseChain: 'Ethereum',
    hasCreatorSupport: false,
    isEnabled: false,
  },
  {
    name: 'Zora',
    shortName: 'ZORA',
    icon: '/icons/zora_logo.svg',
    baseChain: 'Ethereum',
    hasCreatorSupport: false,
    isEnabled: true,
  },
  {
    name: 'POAP',
    shortName: 'POAP',
    icon: '/icons/poap_logo.svg',
    baseChain: 'Gnosis',
    hasCreatorSupport: false,
    isEnabled: true,
  },
  {
    name: 'Arbitrum',
    shortName: 'ARB',
    icon: '/icons/arbitrum_logo.svg',
    baseChain: 'Ethereum',
    hasCreatorSupport: false,
    isEnabled: false,
  },
  {
    name: 'Polygon',
    shortName: 'POLY',
    icon: '/icons/polygon_logo.svg',
    baseChain: 'Ethereum',
    hasCreatorSupport: false,
    isEnabled: false,
  },
] as const;

export type Chain = (typeof chains)[number]['name'];

export type ChainMetadata = (typeof chains)[number];

export const chainsMap = keyBy(chains, 'name') as Record<Chain, ChainMetadata>;

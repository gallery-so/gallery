import keyBy from 'lodash.keyby';

export const chains = [
  { name: 'Ethereum', shortName: 'ETH', icon: '/icons/ethereum_logo.svg', baseChain: 'Ethereum' },
  { name: 'Tezos', shortName: 'TEZ', icon: '/icons/tezos_logo.svg', baseChain: 'Tezos' },
  { name: 'Zora', shortName: 'ZORA', icon: '/icons/zora_logo.svg', baseChain: 'Ethereum' },
  { name: 'POAP', shortName: 'POAP', icon: '/icons/poap_logo.svg', baseChain: 'Ethereum' },
  { name: 'Optimism', shortName: 'OP', icon: '/icons/op_logo.svg', baseChain: 'Ethereum' },
  { name: 'Arbitrum', shortName: 'ARB', icon: '/icons/arbitrum_logo.svg', baseChain: 'Ethereum' },
  { name: 'Polygon', shortName: 'POLY', icon: '/icons/polygon_logo.svg', baseChain: 'Ethereum' },
] as const;

export type Chain = (typeof chains)[number]['name'];

export type ChainMetadata = (typeof chains)[number];

export const chainsMap = keyBy(chains, 'name') as Record<Chain, ChainMetadata>;

export const chains = [
  { name: 'Ethereum', shortName: 'ETH', icon: '/icons/ethereum_logo.svg' },
  { name: 'Tezos', shortName: 'TEZ', icon: '/icons/tezos_logo.svg' },
  { name: 'Zora', shortName: 'ZORA', icon: '/icons/zora_logo.svg' },
  { name: 'POAP', shortName: 'POAP', icon: '/icons/poap_logo.svg' },
  { name: 'Optimism', shortName: 'OP', icon: '/icons/op_logo.svg' },
  { name: 'Arbitrum', shortName: 'ARB', icon: '/icons/arbitrum_logo.svg' },
  { name: 'Polygon', shortName: 'POLY', icon: '/icons/polygon_logo.svg' },
] as const;

export type Chain = (typeof chains)[number]['name'];

export type ChainMetadata = (typeof chains)[number];

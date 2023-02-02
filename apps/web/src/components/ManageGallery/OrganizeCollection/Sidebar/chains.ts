export const chains = [
  { name: 'Ethereum', shortName: 'ETH', icon: '/icons/ethereum_logo.svg' },
  { name: 'Tezos', shortName: 'TEZ', icon: '/icons/tezos_logo.svg' },
  { name: 'POAP', shortName: 'POAP', icon: '/icons/poap_logo.svg' },
] as const;

export type Chain = typeof chains[number]['name'];

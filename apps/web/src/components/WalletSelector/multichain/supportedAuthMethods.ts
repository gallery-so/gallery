export type SupportedAuthMethodKey =
  | 'ethereum'
  | 'gnosisSafe'
  | 'tezos'
  | 'solana'
  | 'delegateCash'
  | 'magicLink';

export type SupportedAuthMethod = {
  name: string;
  // TODO: icon?
};

export const supportedAuthMethods: Readonly<
  Record<SupportedAuthMethodKey, Readonly<SupportedAuthMethod>>
> = {
  ethereum: {
    name: 'Ethereum and L2s',
  },
  gnosisSafe: {
    name: 'Gnosis Safe',
  },
  tezos: {
    name: 'Tezos',
  },
  solana: {
    name: 'Solana',
  },
  delegateCash: {
    name: 'Delegate Cash',
  },
  magicLink: {
    name: 'Email',
  },
};

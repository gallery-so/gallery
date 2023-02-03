export type SupportedAuthMethodKey =
  | 'ethereum'
  | 'gnosisSafe'
  | 'tezos'
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
    name: 'Ethereum',
  },
  gnosisSafe: {
    name: 'Gnosis Safe',
  },
  tezos: {
    name: 'Tezos',
  },
  delegateCash: {
    name: 'Delegate Cash',
  },
  magicLink: {
    name: 'Sign In With Email',
  },
};

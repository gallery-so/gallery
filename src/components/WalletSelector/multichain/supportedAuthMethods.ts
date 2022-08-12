export type SupportedAuthMethodKey = 'ethereum' | 'gnosisSafe';

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
};

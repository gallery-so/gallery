import isProduction from 'utils/isProduction';

export const ALLOWLIST_DEV = [
  '0x4Dd958cA0455BFb231770cD06898894b4c974671',
  '0x75634249C19b12eb98b933C9381876ef723Cf90A',
  '0x8A736ad88E54CEb59e67d07a8498ED08e5586FcF',
];

export const ALLOWLIST_PROD = [];

export const getAllowlist = () => (isProduction() ? ALLOWLIST_PROD : ALLOWLIST_DEV);

import isProduction from 'utils/isProduction';
import { ALLOW_LIST_LEGGENDA } from './data/leggenda';
import { ALLOW_LIST_POOLSUITE } from './data/poolsuite';
import { ALLOW_LIST_CRYPTO_COVEN } from './data/cryptocoven';
import { ALLOW_LIST_FWB } from './data/fwb';
import { ALLOW_LIST_ZENECA } from './data/zeneca';
import { ALLOW_LIST_CUSTOM } from './data/custom';

const ALLOWLIST_DEV: string[] = [];

const ALLOWLIST_PROD = [
  ...ALLOW_LIST_LEGGENDA,
  ...ALLOW_LIST_POOLSUITE,
  ...ALLOW_LIST_CRYPTO_COVEN,
  ...ALLOW_LIST_FWB,
  ...ALLOW_LIST_ZENECA,
  ...ALLOW_LIST_CUSTOM,
].map((s) => s.toLowerCase());

export const getLocalAllowlist = () => new Set(isProduction() ? ALLOWLIST_PROD : ALLOWLIST_DEV);

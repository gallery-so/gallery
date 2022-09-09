import isProduction from 'utils/isProduction';

const ALLOWLIST_DEV: string[] = [];

// if we add any addresses to this list in the future, dont forget to lowercase()
const ALLOWLIST_PROD: string[] = [];

export const getLocalAllowlist = () => new Set(isProduction() ? ALLOWLIST_PROD : ALLOWLIST_DEV);

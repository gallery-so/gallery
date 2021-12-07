// Different steps of Wallet Selector
export const INITIAL = Symbol('INITIAL');
export const ADDRESS_ALREADY_CONNECTED = Symbol('ADDRESS_ALREADY_CONNECTED');
export const CONFIRM_ADDRESS = Symbol('CONFIRM_ADDRESS');
export const PROMPT_SIGNATURE = Symbol('PROMPT_SIGNATURE');
export const LISTENING_ONCHAIN = Symbol('LISTENING_ONCHAIN');
export type PendingState =
  | typeof INITIAL
  | typeof ADDRESS_ALREADY_CONNECTED
  | typeof CONFIRM_ADDRESS
  | typeof PROMPT_SIGNATURE
  | typeof LISTENING_ONCHAIN;

// The modes that Wallet Selector can be used for
export const AUTH = Symbol('AUTH');
export const ADD_WALLET_TO_USER = Symbol('ADD_WALLET_TO_USER');
export const CONNECT_WALLET_ONLY = Symbol('CONNECT_WALLET_ONLY');

// Ethereum account type
export const EXTERNALLY_OWNED_ACCOUNT = Symbol('EXTERNALLY_OWNED_ACCOUNT');
export const CONTRACT_ACCOUNT = Symbol('CONTRACT_ACCOUNT');

export const METAMASK = Symbol('METAMASK');
export const WALLETCONNECT = Symbol('WALLETCONNECT');
export const WALLETLINK = Symbol('WALLETLINK');
export const GNOSIS_SAFE = Symbol('GNOSIS_SAFE');

export type WalletName =
  | typeof METAMASK
  | typeof WALLETCONNECT
  | typeof WALLETLINK
  | typeof GNOSIS_SAFE;

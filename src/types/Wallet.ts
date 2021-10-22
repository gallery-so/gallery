// Different steps of Wallet Selector
export const INITIAL = Symbol('INITIAL');
export const ADDRESS_ALREADY_CONNECTED = Symbol('ADDRESS_ALREADY_CONNECTED');
export const CONFIRM_ADDRESS = Symbol('CONFIRM_ADDRESS');
export const PROMPT_SIGNATURE = Symbol('PROMPT_SIGNATURE');

// The modes that Wallet Selector can be used for
export const AUTH = Symbol('AUTH');
export const ADD_WALLET_TO_USER = Symbol('ADD_WALLET_TO_USER');
export const CONNECT_WALLET_ONLY = Symbol('CONNECT_WALLET_ONLY');

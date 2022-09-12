import { Chain } from '../__generated__/operations';

export const GALLERY_USER_DBID = 'TestUserId';
export const GALLERY_USER_ID = `User:${GALLERY_USER_DBID}`;
export const GALLERY_USER_USERNAME = `SomeUsername`;

export const WALLETS = {
  MainEthereum: {
    DBID: 'MainEthereum',
    ID: 'Wallet:MainEthereum',
    CHAIN: Chain.Ethereum,
    ADDRESS: '0x0Ff979fB365e20c09bE06676D569EF581a46621D',
  },
} as const;

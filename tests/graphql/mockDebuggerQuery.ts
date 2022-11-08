import { DebuggerQueryQuery } from '~/generated/operations';

import { GALLERY_USER_DBID, GALLERY_USER_ID, GALLERY_USER_USERNAME, WALLETS } from '../constants';
import { mockGraphqlQuery } from './mockGraphqlQuery';

export function mockDebuggerQuery() {
  const response: DebuggerQueryQuery = {
    __typename: 'Query',
    viewer: {
      __typename: 'Viewer',
      user: {
        __typename: 'GalleryUser',
        id: GALLERY_USER_ID,
        dbid: GALLERY_USER_DBID,
        username: GALLERY_USER_USERNAME,
        wallets: [
          {
            __typename: 'Wallet',
            id: WALLETS.MainEthereum.ID,
            dbid: WALLETS.MainEthereum.DBID,
            chainAddress: {
              __typename: 'ChainAddress',
              address: WALLETS.MainEthereum.ADDRESS,
              chain: WALLETS.MainEthereum.CHAIN,
            },
          },
        ],
      },
    },
  };

  return mockGraphqlQuery('DebuggerQuery', response);
}

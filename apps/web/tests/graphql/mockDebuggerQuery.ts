import { DebuggerQueryQuery } from '~/tests/__generated__/graphql-codegen/operations';

import {
  GALLERY_USER_DBID,
  GALLERY_USER_ID,
  GALLERY_USER_USERNAME,
  GALLERY_VIEWER_ID,
  WALLETS,
} from '../constants';
import { mockGraphqlQuery } from './mockGraphqlQuery';

export function mockDebuggerQuery() {
  const response: DebuggerQueryQuery = {
    __typename: 'Query',
    viewer: {
      __typename: 'Viewer',
      id: GALLERY_VIEWER_ID,
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
          },
        ],
      },
    },
  };

  return mockGraphqlQuery('DebuggerQuery', response);
}

import { GlobalLayoutContextQueryQuery } from '~/tests/__generated__/graphql-codegen/operations';

import { GALLERY_USER_ID, GALLERY_VIEWER_ID } from '../constants';
import { mockGraphqlQuery } from './mockGraphqlQuery';

export function mockGlobalLayoutQuery() {
  const response: GlobalLayoutContextQueryQuery = {
    __typename: 'Query',
    collections: [],
    viewer: {
      __typename: 'Viewer',
      id: GALLERY_VIEWER_ID,
      user: {
        __typename: 'GalleryUser',
        id: GALLERY_USER_ID,
        username: 'Test Gallery User',
        wallets: [],
        // @ts-expect-error not sure what the issue is
        roles: ['ADMIN'],
        primaryWallet: {
          __typename: 'Wallet',
          id: '123',
          dbid: '123',
          chainAddress: {
            __typename: 'ChainAddress',
            address: '0x123',
            chain: null,
          },
        },
      },
    },
  };

  return mockGraphqlQuery('GlobalLayoutContextQuery', response);
}

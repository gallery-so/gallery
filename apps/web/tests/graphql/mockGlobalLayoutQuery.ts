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
        // @ts-expect-error not sure what the issue is
        userExperiences: [],
        wallets: [],
        roles: ['ADMIN'],
        primaryWallet: {
          __typename: 'Wallet',
          id: '123',
        },
      },
    },
  };

  return mockGraphqlQuery('GlobalLayoutContextQuery', response);
}

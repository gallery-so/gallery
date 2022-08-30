import { mockGraphqlQuery } from './mockGraphqlQuery';
import { GlobalLayoutContextQueryQuery } from '../../src/__generated__/operations';
import { GALLERY_USER_DBID, GALLERY_USER_ID, GALLERY_USER_USERNAME, WALLETS } from '../constants';

export function mockGlobalLayoutQuery() {
  const response: GlobalLayoutContextQueryQuery = {
    __typename: 'Query',
    viewer: {
      __typename: 'Viewer',
      user: {
        __typename: 'GalleryUser',
        id: GALLERY_USER_ID,
        dbid: GALLERY_USER_DBID,
        username: GALLERY_USER_USERNAME,
        bio: 'Some Bio',
        wallets: [
          {
            __typename: 'Wallet',
            id: WALLETS.MainEthereum.ID,
            dbid: WALLETS.MainEthereum.DBID,
            chainAddress: {
              __typename: 'ChainAddress',
              address: WALLETS.MainEthereum.ADDRESS,
            },
          },
        ],
      },
    },
  };

  return mockGraphqlQuery('GlobalLayoutContextQuery', response);
}

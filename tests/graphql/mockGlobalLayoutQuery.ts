import { mockGraphqlQuery } from './mockGraphqlQuery';
import { GlobalLayoutContextQueryQuery } from '../../__generated__/operations';
import { GALLERY_USER_DBID, GALLERY_USER_ID } from '../constants';

export function mockGlobalLayoutQuery() {
  const response: GlobalLayoutContextQueryQuery = {
    __typename: 'Query',
    viewer: {
      __typename: 'Viewer',
      user: {
        __typename: 'GalleryUser',
        id: GALLERY_USER_ID,
        dbid: GALLERY_USER_DBID,
      },
    },
  };

  return mockGraphqlQuery('GlobalLayoutContextQuery', response);
}

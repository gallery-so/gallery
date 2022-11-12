import { GlobalLayoutContextQueryQuery } from '~/generated/operations';

import { GALLERY_USER_ID } from '../constants';
import { mockGraphqlQuery } from './mockGraphqlQuery';

export function mockGlobalLayoutQuery() {
  const response: GlobalLayoutContextQueryQuery = {
    __typename: 'Query',
    viewer: {
      __typename: 'Viewer',
      user: {
        __typename: 'GalleryUser',
        roles: [],
        id: GALLERY_USER_ID,
      },
    },
  };

  return mockGraphqlQuery('GlobalLayoutContextQuery', response);
}

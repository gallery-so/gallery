import { ErrorReportingContextQueryQuery } from '~/tests/__generated__/graphql-codegen/operations';

import { GALLERY_USER_DBID, GALLERY_USER_ID, GALLERY_VIEWER_ID } from '../constants';
import { mockGraphqlQuery } from './mockGraphqlQuery';

export function mockErrorReportingContextQuery() {
  const response: ErrorReportingContextQueryQuery = {
    __typename: 'Query',
    viewer: {
      __typename: 'Viewer',
      id: GALLERY_VIEWER_ID,
      user: {
        __typename: 'GalleryUser',
        id: GALLERY_USER_ID,
        dbid: GALLERY_USER_DBID,
      },
    },
  };

  return mockGraphqlQuery('ErrorReportingContextQuery', response);
}

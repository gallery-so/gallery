import { mockErrorReportingContextQuery } from '~/tests/graphql/mockErrorReportingContextQuery';

import { mockDebuggerQuery } from './mockDebuggerQuery';
import { mockGlobalLayoutQuery } from './mockGlobalLayoutQuery';

export function mockProviderQueries() {
  mockDebuggerQuery();
  mockGlobalLayoutQuery();
  mockErrorReportingContextQuery();
}

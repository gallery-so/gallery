import { mockGraphqlQuery } from '~/tests/graphql/mockGraphqlQuery';

export function mockProviderQueries() {
  mockGraphqlQuery('useAddWalletModalQuery', {});
  mockGraphqlQuery('AnalyticsContextQuery', {});
  mockGraphqlQuery('DebuggerQuery', {});
  mockGraphqlQuery('GlobalLayoutContextQuery', {});
  mockGraphqlQuery('ErrorReportingContextQuery', {});
}

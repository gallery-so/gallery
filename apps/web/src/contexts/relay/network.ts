import { getCurrentHub, startTransaction } from '@sentry/nextjs';
import { Transaction } from '@sentry/types';
import { FetchFunction, RequestParameters, SubscribeFunction } from 'relay-runtime';

import { baseurl } from '~/contexts/swr/fetch';
import {
  createRelayFetchFunction,
  createRelaySubscribeFunction,
  PersistedQueriesMap,
} from '~/shared/relay/network';
// Use this once we fix the ERRCONNRESET issue
// import { baseUrl } from '~/utils/baseUrl';

export function getGraphqlHost() {
  // Use this once we fix the ERRCONNRESET issue
  // return baseUrl
  return baseurl;
}

export function getGraphqlPath(operationName: string) {
  return `/glry/graphql/query/${operationName}`;
}

export function getGraphqlUrl(operationName: string) {
  return `${getGraphqlHost()}${getGraphqlPath(operationName)}`;
}

/**
 * Configure sentry tracing.
 *
 * Currently, we have Browser Tracing handled in `sentry.client.config.js`, where Queries that correspond with
 * page loads and page navigations are tracked out-of-the-box.
 *
 * However, there are other requests that are fired outside of simple page events – most notably Mutations.
 * This middleware enables us to auto-trace Mutations without manually writing them within each hook.
 *
 * More on tracing config:
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/performance/instrumentation/custom-instrumentation
 */
function initSentryTracing(request: RequestParameters): Transaction | null {
  if (request.operationKind === 'mutation') {
    const transaction = startTransaction({ name: request.name, op: 'mutation' });
    getCurrentHub().configureScope((scope) => scope.setSpan(transaction));
    return transaction;
  }

  return null;
}

function teardownSentryTracing(transaction: Transaction | null) {
  transaction?.finish();
}

const fetchFunctionWithoutTracing = createRelayFetchFunction({
  url: (request) => getGraphqlUrl(request.name),
  headers: () => {
    const platform = navigator.platform;

    let osHeader = 'Unknown';
    if (platform.startsWith('Mac')) {
      // The user is on a Mac
      osHeader = 'Mac';
    } else if (platform.startsWith('Win')) {
      // The user is on Windows
      osHeader = 'Windows';
    } else if (platform.startsWith('Linux')) {
      // The user is on Linux
      osHeader = 'Linux';
    }

    return {
      'X-Platform': 'Web',
      'X-OS': osHeader,
    };
  },
  persistedQueriesFetcher: () =>
    import('persisted_queries.json').then((map) => {
      // @ts-expect-error Types not aligning because it's a module
      return map as PersistedQueriesMap;
    }),
});

export const relaySubscribeFunction: SubscribeFunction = createRelaySubscribeFunction({
  url: process.env.NEXT_PUBLIC_GRAPHQL_SUBSCRIPTION_URL as string,
});

export const relayFetchFunction: FetchFunction = (request, variables, cacheConfig, uploadables) => {
  // ---------- begin pre-request hooks
  const transaction = initSentryTracing(request);
  // ---------- end pre-request hooks

  try {
    return fetchFunctionWithoutTracing(request, variables, cacheConfig, uploadables);
  } finally {
    // ---------- begin post-request hooks
    teardownSentryTracing(transaction);
    // ---------- end post-request hooks
  }
};

import { FetchFunction, GraphQLResponse, RequestParameters } from 'relay-runtime';
import { _fetch, baseurl } from 'contexts/swr/fetch';
import { startTransaction, getCurrentHub } from '@sentry/nextjs';
import { Transaction } from '@sentry/types';

/**
 * This is how Relay takes an arbitrary GraphQL request, and asks for a response.
 * Since we don't currently have a GraphQL server, we're shimming a response as
 * an example.
 */
export const relayFetchFunction: FetchFunction = async (request, variables) => {
  // ---------- begin pre-request hooks
  const transaction = initSentryTracing(request);
  // ---------- end pre-request hooks

  const response = _fetch<GraphQLResponse>(`${baseurl}/glry/graphql/query`, {
    body: {
      query: request.text,
      variables,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ---------- begin post-request hooks
  teardownSentryTracing(transaction);
  // ---------- end post-request hooks

  return response;
};

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

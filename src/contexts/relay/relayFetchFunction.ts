import { getCurrentHub, startTransaction } from '@sentry/nextjs';
import { Transaction } from '@sentry/types';
import {
  FetchFunction,
  GraphQLSingularResponse,
  PayloadError,
  RequestParameters,
} from 'relay-runtime';

import { baseurl } from '~/contexts/swr/fetch';
// Use this once we fix the ERRCONNRESET issue
// import { baseUrl } from '~/utils/baseUrl';

export function getGraphqlHost() {
  // Use this once we fix the ERRCONNRESET issue
  // return baseUrl
  return baseurl;
}

export function getGraphqlPath() {
  return `/glry/graphql/query`;
}

export function getGraphqlUrl(operationName: string) {
  return `${getGraphqlHost()}${getGraphqlPath()}/${operationName}`;
}

type InternalFetchFunction = (
  ...args: Parameters<FetchFunction>
) => Promise<GraphQLSingularResponse>;
const fetchWithJustHash: InternalFetchFunction = async (request, variables) => {
  const response = await fetch(getGraphqlUrl(request.name), {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      operationName: request.name,
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: request.id,
        },
      },
      variables,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());

  return response;
};

const fetchWithHashAndQueryText: InternalFetchFunction = async (request, variables) => {
  const persisted_queries = await import('persisted_queries.json');

  // @ts-expect-error Types aren't lining up here
  const queryText = persisted_queries[request.id] as string;

  const response = await fetch(getGraphqlUrl(request.name), {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      operationName: request.name,
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: request.id,
        },
      },
      query: queryText,
      variables,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());

  return response;
};

/**
 * This is how Relay takes an arbitrary GraphQL request, and asks for a response.
 * Since we don't currently have a GraphQL server, we're shimming a response as
 * an example.
 */
export const relayFetchFunction: FetchFunction = async (
  request,
  variables,
  cacheConfig,
  uploadables
) => {
  // ---------- begin pre-request hooks
  const transaction = initSentryTracing(request);
  // ---------- end pre-request hooks

  try {
    let response = await fetchWithJustHash(request, variables, cacheConfig, uploadables);

    if ('errors' in response) {
      const persistedQueryWasNotFound = response.errors?.some(
        (error) => error.message === 'PersistedQueryNotFound'
      );

      if (persistedQueryWasNotFound) {
        response = await fetchWithHashAndQueryText(request, variables, cacheConfig, uploadables);
      }
    }

    return response;
  } catch (error) {
    const payloadError: PayloadError =
      error instanceof Error
        ? { message: error.message, severity: 'CRITICAL' }
        : { message: 'An unexpected error occurred in relayFetchFunction', severity: 'CRITICAL' };

    return { errors: [payloadError] };
  } finally {
    // ---------- begin post-request hooks
    teardownSentryTracing(transaction);
    // ---------- end post-request hooks
  }
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

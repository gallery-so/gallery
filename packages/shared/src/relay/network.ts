import { Client, createClient } from 'graphql-ws';
import { Observable, SubscribeFunction } from 'relay-runtime';
import { FetchFunction, GraphQLSingularResponse, PayloadError } from 'relay-runtime';

import { isResponsePersistedQueryNotFound } from './utils';

export type PersistedQueriesMap = Record<string, string>;

export type PersistedQueriesFetcher = () => Promise<PersistedQueriesMap>;

type InternalFetchFunction = (
  createRelayFetchFunctionArgs: CreateRelayFetchFunctionArgs,
  ...args: Parameters<FetchFunction>
) => Promise<GraphQLSingularResponse>;

const fetchWithJustHash: InternalFetchFunction = async (
  { url, headers },
  request,
  variables,
  cacheConfig,
  uploadables
) => {
  const response = await fetch(url(request, variables, cacheConfig, uploadables), {
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
      ...headers(request, variables, cacheConfig, uploadables),
    },
  }).then((response) => response.json());

  return response;
};

const fetchWithHashAndQueryText: InternalFetchFunction = async (
  { url, persistedQueriesFetcher, headers },
  request,
  variables,
  cacheConfig,
  uploadables
) => {
  const persisted_queries = await persistedQueriesFetcher();

  // @ts-expect-error Types aren't lining up here
  const queryText = persisted_queries[request.id] as string;

  const response = await fetch(url(request, variables, cacheConfig, uploadables), {
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
      ...headers(request, variables, cacheConfig, uploadables),
    },
  }).then((response) => response.json());

  return response;
};

type CreateRelayFetchFunctionArgs = {
  url: (...args: Parameters<FetchFunction>) => string;
  headers: (...args: Parameters<FetchFunction>) => Record<string, string>;
  persistedQueriesFetcher: PersistedQueriesFetcher;
};

export function createRelayFetchFunction(args: CreateRelayFetchFunctionArgs): FetchFunction {
  /**
   * This is how Relay takes an arbitrary GraphQL request, and asks for a response.
   * Since we don't currently have a GraphQL server, we're shimming a response as
   * an example.
   */
  const relayFetchFunction: FetchFunction = async (
    request,
    variables,
    cacheConfig,
    uploadables
  ) => {
    try {
      let response = await fetchWithJustHash(args, request, variables, cacheConfig, uploadables);

      const persistedQueryWasNotFound = isResponsePersistedQueryNotFound(response);

      if (persistedQueryWasNotFound) {
        response = await fetchWithHashAndQueryText(
          args,
          request,
          variables,
          cacheConfig,
          uploadables
        );
      }

      return response;
    } catch (error) {
      const payloadError: PayloadError =
        error instanceof Error
          ? { message: error.message, severity: 'CRITICAL' }
          : {
              message: 'An unexpected error occurred in relayFetchFunction',
              severity: 'CRITICAL',
            };

      return { errors: [payloadError] };
    }
  };

  return relayFetchFunction;
}

type CreateRelaySubscribeFunctionArgs = {
  url: string;
};

export function createRelaySubscribeFunction({ url }: CreateRelaySubscribeFunctionArgs) {
  let websocketClient: Client;

  if (typeof WebSocket !== 'undefined') {
    websocketClient = createClient({
      url,
    });
  }

  const relaySubscribeFunction: SubscribeFunction = (operation, variables) => {
    return Observable.create((sink) => {
      if (!operation.text) {
        throw new Error('Relay subscribe function called without any operation text');
      }

      return websocketClient.subscribe(
        {
          operationName: operation.name,
          query: operation.text,
          variables,
        },
        // @ts-expect-error types arent' lining up
        sink
      );
    });
  };

  return relaySubscribeFunction;
}

export const fetchWithJustQueryText = async ({ queryText, variables }) => {
  const response = await fetch('https://api.gallery.so/glry/graphql/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: queryText,
      variables,
    }),
  }).then((response) => response.json());

  return response;
};

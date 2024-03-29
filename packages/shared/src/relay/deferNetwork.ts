import fetchMultipart from 'fetch-multipart-graphql';
import { FetchFunction, GraphQLSingularResponse, Observable } from 'relay-runtime';

import { isResponsePersistedQueryNotFound } from './utils';

export type PersistedQueriesMap = Record<string, string>;

export type PersistedQueriesFetcher = () => Promise<PersistedQueriesMap>;

type DeferResponse =
  | {
      hasNext?: boolean;
      incremental: GraphQLSingularResponse[];
    }
  | { data: GraphQLSingularResponse; hasNext?: boolean }
  | GraphQLSingularResponse;

type InternalFetchFunction = (
  createRelayFetchFunctionArgs: CreateRelayFetchFunctionArgs,
  sinkHandlers: SinkHandlers,
  ...args: Parameters<FetchFunction>
) => ReturnType<typeof fetchMultipart<DeferResponse>>;

type SinkHandlers = {
  onError: (error: unknown) => void;
  onNext: (data: DeferResponse[]) => void;
  onComplete: () => void;
};

type FlattenedDeferResponse = {
  data: ReadonlyArray<GraphQLSingularResponse>;
  isLast: boolean;
};

function flattenDeferResponse(responses: DeferResponse[]): FlattenedDeferResponse {
  const formatted: ReadonlyArray<GraphQLSingularResponse> = responses.flatMap((part) => {
    if ('incremental' in part) {
      return part.incremental;
    }

    return [part];
  });

  const anyOfTheResponsesAreTheLast = responses.some((response) => {
    // This query is not deferred and should finish immediately.
    if (!response.hasOwnProperty('hasNext')) {
      return true;
    }

    if ('hasNext' in response) {
      return !response.hasNext;
    }

    return false;
  });

  if (anyOfTheResponsesAreTheLast) {
    const lastPart = formatted[formatted.length - 1];

    if (lastPart) {
      // Shoutout the Coinbase folks https://github.com/facebook/relay/issues/3904
      lastPart.extensions = { is_final: true };
    }
  }

  return { data: formatted, isLast: anyOfTheResponsesAreTheLast };
}

const fetchWithJustHash: InternalFetchFunction = async (
  { url, headers },
  sinkHandlers,
  request,
  variables,
  cacheConfig,
  uploadables
) => {
  return fetchMultipart<DeferResponse>(url(request, variables, cacheConfig, uploadables), {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      operationName: request.name,
      query: request.text,
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
      Accept: 'multipart/mixed; deferSpec=20220824',
      ...headers(request, variables, cacheConfig, uploadables),
    },
    ...sinkHandlers,
  });
};

const fetchWithHashAndQueryText: InternalFetchFunction = async (
  { url, persistedQueriesFetcher, headers },
  sinkHandlers,
  request,
  variables,
  cacheConfig,
  uploadables
) => {
  const persisted_queries = await persistedQueriesFetcher();

  // @ts-expect-error Types aren't lining up here
  const queryText = persisted_queries[request.id] as string;

  return fetchMultipart(url(request, variables, cacheConfig, uploadables), {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      operationName: request.name,
      query: queryText,
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
      Accept: 'multipart/mixed; deferSpec=20220824',
      ...headers(request, variables, cacheConfig, uploadables),
    },
    ...sinkHandlers,
  });
};

type CreateRelayFetchFunctionArgs = {
  headers: (...args: Parameters<FetchFunction>) => Record<string, string>;
  url: (...args: Parameters<FetchFunction>) => string;
  persistedQueriesFetcher: PersistedQueriesFetcher;
};

export function createRelayFetchFunctionWithDefer(
  args: CreateRelayFetchFunctionArgs
): FetchFunction {
  const relayFetchFunction: FetchFunction = (request, variables, cacheConfig, uploadables) => {
    return Observable.create((sink) => {
      const sinkHandlers: SinkHandlers = {
        onComplete: () => sink.complete(),
        onError: (error) => sink.error(error as Error),
        onNext: (responses) => {
          const wasPersistedQueryNotFound = responses.some((response) => {
            if ('errors' in response) {
              return isResponsePersistedQueryNotFound(response);
            }

            return false;
          });

          if (wasPersistedQueryNotFound) {
            fetchWithHashAndQueryText(
              args,
              sinkHandlers,
              request,
              variables,
              cacheConfig,
              uploadables
            );
          } else {
            const allErrors = responses.flatMap((response) => {
              if ('errors' in response) {
                return response.errors;
              }

              return [];
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            allErrors.forEach((error) => {
              // Turn this on if you want to see network errors
              // console.error(error);
            });

            const { data, isLast } = flattenDeferResponse(responses);

            sink.next(data);

            if (isLast) {
              sink.complete();
            }
          }
        },
      };

      fetchWithJustHash(args, sinkHandlers, request, variables, cacheConfig, uploadables);
    });
  };

  return relayFetchFunction;
}

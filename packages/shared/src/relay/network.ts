import fetchMultipart from "fetch-multipart-graphql";
import { Client, createClient } from "graphql-ws";
import { Observable, SubscribeFunction } from "relay-runtime";
import {
  FetchFunction,
  GraphQLSingularResponse,
  PayloadError,
} from "relay-runtime";

export type PersistedQueriesMap = Record<string, string>;

export type PersistedQueriesFetcher = () => Promise<PersistedQueriesMap>;

type InternalFetchFunction = (
  createRelayFetchFunctionArgs: CreateRelayFetchFunctionArgs,
  ...args: Parameters<FetchFunction>
) => Promise<GraphQLSingularResponse>;

const fetchWithJustHash: InternalFetchFunction = async (
  { url },
  request,
  variables,
  cacheConfig,
  uploadables
) => {
  const response = await fetch(
    url(request, variables, cacheConfig, uploadables),
    {
      method: "POST",
      credentials: "include",
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
        "Content-Type": "application/json",
      },
    }
  ).then((response) => response.json());

  return response;
};

const fetchWithHashAndQueryText: InternalFetchFunction = async (
  { url, persistedQueriesFetcher },
  request,
  variables,
  cacheConfig,
  uploadables
) => {
  const persisted_queries = await persistedQueriesFetcher();

  // @ts-expect-error Types aren't lining up here
  const queryText = persisted_queries[request.id] as string;

  const response = await fetchMultipart(
    url(request, variables, cacheConfig, uploadables),
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Accept: "multipart/mixed; deferSpec=20220824",
      },
      body: JSON.stringify({ query: queryText, variables }),
      credentials: "include",
      onNext: (res) => {
        const parts = res as (
          | {
              hasNext?: boolean;
              incremental: {
                path: string[];
                label: string;
                data: PayloadData;
              }[];
            }
          | { data: PayloadData; hasNext?: boolean }
        )[];
        const formatted = parts.flatMap((part) => {
          if ("incremental" in part) {
            return part.incremental;
          }
          return part;
        });
        sink.next(formatted);
      },
      onError: (err) => sink.error(err),
      onComplete: () => {
        console.log(request.name, "Sink complete");
        sink.complete();
      },
    }
  ).then((response) => response.json());

  return response;
};

type CreateRelayFetchFunctionArgs = {
  url: (...args: Parameters<FetchFunction>) => string;
  persistedQueriesFetcher: PersistedQueriesFetcher;
};

export function createRelayFetchFunction(
  args: CreateRelayFetchFunctionArgs
): FetchFunction {
  /**
   * This is how Relay takes an arbitrary GraphQL request, and asks for a response.
   * Since we don't currently have a GraphQL server, we're shimming a response as
   * an example.
   */
  const relayFetchFunction: FetchFunction = (
    request,
    variables,
    cacheConfig,
    uploadables
  ) => {
    return Observable.create((sink) => {
      args.persistedQueriesFetcher().then((persisted_queries) => {
        // @ts-expect-error Types aren't lining up here
        const queryText = persisted_queries[request.id] as string;
        fetchMultipart(args.url(request, variables, cacheConfig, uploadables), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Accept: "multipart/mixed; deferSpec=20220824",
          },
          body: JSON.stringify({ query: queryText, variables }),
          credentials: "include",
          onNext: (res) => {
            const parts = res as (
              | {
                  hasNext?: boolean;
                  incremental: {
                    path: string[];
                    label: string;
                    data: unknown;
                  }[];
                }
              | { data: unknown; hasNext?: boolean }
            )[];

            const formatted = parts.flatMap((part) => {
              if ("incremental" in part) {
                return part.incremental;
              }
              return part;
            });

            sink.next(formatted);

            if (parts.some((it) => !it.hasNext)) {
              sink.complete();
            }
          },
          onError: (err) => {
            console.error(err);
            sink.error(err);
          },
          onComplete: () => {
            console.log(request.name, "Sink complete");
            sink.complete();
          },
        });
      });
    });
  };

  return relayFetchFunction;
}

type CreateRelaySubscribeFunctionArgs = {
  url: string;
};

export function createRelaySubscribeFunction({
  url,
}: CreateRelaySubscribeFunctionArgs) {
  let websocketClient: Client;

  if (typeof WebSocket !== "undefined") {
    websocketClient = createClient({
      url,
    });
  }

  const relaySubscribeFunction: SubscribeFunction = (operation, variables) => {
    return Observable.create((sink) => {
      if (!operation.text) {
        throw new Error(
          "Relay subscribe function called without any operation text"
        );
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

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
        query: queryText,
        variables,
      }),
      headers: {
        "Content-Type": "application/json",
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
  const relayFetchFunction: FetchFunction = async (
    request,
    variables,
    cacheConfig,
    uploadables
  ) => {
    try {
      let response = await fetchWithJustHash(
        args,
        request,
        variables,
        cacheConfig,
        uploadables
      );

      if ("errors" in response) {
        const persistedQueryWasNotFound = response.errors?.some(
          (error) => error.message === "PersistedQueryNotFound"
        );

        if (persistedQueryWasNotFound) {
          response = await fetchWithHashAndQueryText(
            args,
            request,
            variables,
            cacheConfig,
            uploadables
          );
        }
      }

      return response;
    } catch (error) {
      const payloadError: PayloadError =
        error instanceof Error
          ? { message: error.message, severity: "CRITICAL" }
          : {
              message: "An unexpected error occurred in relayFetchFunction",
              severity: "CRITICAL",
            };

      return { errors: [payloadError] };
    }
  };

  return relayFetchFunction;
}

import {
  FetchFunction,
  GraphQLSingularResponse,
  PayloadError,
} from "relay-runtime";

export function getGraphqlPath(operationName: string) {
  return `/glry/graphql/query/${operationName}`;
}

export function getGraphqlUrl(operationName: string) {
  return `https://api.gallery.so${getGraphqlPath(operationName)}`;
}

type InternalFetchFunction = (
  ...args: Parameters<FetchFunction>
) => Promise<GraphQLSingularResponse>;

const fetchWithJustHash: InternalFetchFunction = async (request, variables) => {
  const response = await fetch(getGraphqlUrl(request.name), {
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
  }).then((response) => response.json());

  return response;
};

const fetchWithHashAndQueryText: InternalFetchFunction = async (
  request,
  variables
) => {
  const persisted_queries = await import("persisted_queries.json");

  // @ts-expect-error Types aren't lining up here
  const queryText = persisted_queries[request.id] as string;

  const response = await fetch(getGraphqlUrl(request.name), {
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
  try {
    let response = await fetchWithJustHash(
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

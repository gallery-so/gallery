import { GraphQLSingularResponse } from "relay-runtime";

export function isResponsePersistedQueryNotFound(
  response: GraphQLSingularResponse
) {
  if ("errors" in response) {
    const persistedQueryWasNotFound = response.errors?.some(
      (error) => error.message === "PersistedQueryNotFound"
    );

    return persistedQueryWasNotFound;
  }

  return false;
}

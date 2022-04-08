import { FetchFunction, GraphQLResponse } from 'relay-runtime';
import { _fetch, baseurl } from 'contexts/swr/useFetcher';

/**
 * This is how Relay takes an arbitrary GraphQL request, and asks for a response.
 * Since we don't currently have a GraphQL server, we're shimming a response as
 * an example.
 */
export const relayFetchFunction: FetchFunction = async (request, variables) => {
  return _fetch<GraphQLResponse>(`${baseurl}/glry/graphql/query`, 'graphql request', {
    body: {
      query: request.text,
      variables,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

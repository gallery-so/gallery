import { Observable, SubscribeFunction } from 'relay-runtime';
import { Client, createClient } from 'graphql-ws';
import { getGraphqlUrl } from 'contexts/relay/constants';

let websocketClient: Client;

if (typeof window !== 'undefined') {
  websocketClient = createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_SUBSCRIPTION_URL!,
  });
}

export const relaySubscribeFunction: SubscribeFunction = (operation, variables) => {
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
      // @ts-expect-error null / undefined not lining up
      sink
    );
  });
};

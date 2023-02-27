import { Client, createClient } from 'graphql-ws';
import { Observable, SubscribeFunction } from 'relay-runtime';

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

import { Platform } from 'react-native';
import { Environment } from 'react-relay';
import { Network, RecordSource, Store } from 'relay-runtime';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';
import { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';

import { createRelayFetchFunctionWithDefer } from '~/shared/relay/deferNetwork';
import { createMissingFieldHandlers } from '~/shared/relay/missingFieldHandlers';
import { createRelaySubscribeFunction, PersistedQueriesMap } from '~/shared/relay/network';

import persistedQueries from '../../../persisted_queries.json';

const persistedQueriesMap = persistedQueries as PersistedQueriesMap;

// TODO env
const relaySubscribeFunction = createRelaySubscribeFunction({
  url: 'wss://api.gallery.so/glry/graphql/query',
});

// TODO env
export const relayFetchFunction = createRelayFetchFunctionWithDefer({
  url: () => 'https://gateway.gallery.so',
  headers: () => {
    return {
      'X-OS': Platform.OS,
      'X-Platform': 'Mobile',
    };
  },
  persistedQueriesFetcher: async () => persistedQueriesMap,
});

export const createRelayEnvironment = (records?: RecordMap): Environment =>
  new RelayModernEnvironment({
    missingFieldHandlers: createMissingFieldHandlers(),
    store: new Store(new RecordSource(records ?? {})),
    network: Network.create(relayFetchFunction, relaySubscribeFunction),
  });

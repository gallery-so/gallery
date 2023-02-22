import { Environment } from "react-relay";
import { Network, RecordSource, Store } from "relay-runtime";
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment";
import { RecordMap } from "relay-runtime/lib/store/RelayStoreTypes";

import { createRelayFetchFunctionWithDefer } from "~/shared/relay/deferNetwork";
import {
  createRelaySubscribeFunction,
  PersistedQueriesMap,
} from "~/shared/relay/network";

import persistedQueries from "../../../persisted_queries.json";

const persistedQueriesMap = persistedQueries as PersistedQueriesMap;

const relaySubscribeFunction = createRelaySubscribeFunction({
  url: "wss://api.gallery.so/glry/graphql/query",
});

export const relayFetchFunction = createRelayFetchFunctionWithDefer({
  url: () => "https://gateway.gallery.so",
  persistedQueriesFetcher: async () => persistedQueriesMap,
});

export const createRelayEnvironment = (records?: RecordMap): Environment =>
  new RelayModernEnvironment({
    store: new Store(new RecordSource(records ?? {})),
    network: Network.create(relayFetchFunction, relaySubscribeFunction),
  });

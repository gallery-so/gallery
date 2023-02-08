import { Environment } from "react-relay";
import { Network, RecordSource, Store } from "relay-runtime";
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment";
import { RecordMap } from "relay-runtime/lib/store/RelayStoreTypes";

import { relayFetchFunction } from "./relayFetchFunction";
import { relaySubscribeFunction } from "./relaySubscribeFunction";

export const serializeRelayEnvironment = (environment: Environment) =>
  environment.getStore().getSource().toJSON();

export const createRelayEnvironment = (records?: RecordMap): Environment =>
  new RelayModernEnvironment({
    store: new Store(new RecordSource(records ?? {})),
    network: Network.create(relayFetchFunction, relaySubscribeFunction),
  });

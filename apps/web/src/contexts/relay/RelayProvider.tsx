import { Environment } from 'react-relay';
import { Network, RecordSource, Store } from 'relay-runtime';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';
import { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';

import { relayFetchFunction, relaySubscribeFunction } from '~/contexts/relay/network';
import { createMissingFieldHandlers } from '~/shared/relay/missingFieldHandlers';

export const serializeRelayEnvironment = (environment: Environment) =>
  environment.getStore().getSource().toJSON();

export const createServerSideRelayEnvironment = (): Environment =>
  new RelayModernEnvironment({
    store: new Store(new RecordSource({})),
    network: Network.create(relayFetchFunction, relaySubscribeFunction),
  });

export const createRelayEnvironmentFromRecords = (records?: RecordMap): Environment =>
  new RelayModernEnvironment({
    missingFieldHandlers: createMissingFieldHandlers(),
    store: new Store(new RecordSource(records ?? {})),
    network: Network.create(relayFetchFunction, relaySubscribeFunction),
  });

export const createEmptyRelayEnvironment = (): Environment => createRelayEnvironmentFromRecords({});

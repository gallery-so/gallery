import { ReactNode, useState } from 'react';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';
import { Environment, RelayEnvironmentProvider } from 'react-relay';
import { Network, RecordSource, Store } from 'relay-runtime';
import { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';
import { relayFetchFunction } from 'contexts/relay/relayFetchFunction';

export const serializeRelayEnvironment = (environment: Environment) =>
  environment.getStore().getSource().toJSON();

export const createServerSideRelayEnvironment = (): Environment =>
  new RelayModernEnvironment({
    store: new Store(new RecordSource({})),
    network: Network.create(relayFetchFunction),
  });

export const createRelayEnvironmentFromRecords = (records?: RecordMap): Environment =>
  new RelayModernEnvironment({
    store: new Store(new RecordSource(records ?? {})),
    network: Network.create(relayFetchFunction),
  });

export function RelayProvider({
  children,
  initialCache,
}: {
  children: ReactNode;
  initialCache?: RecordMap;
}) {
  const [relayEnvironment] = useState(() => createRelayEnvironmentFromRecords(initialCache));

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>{children}</RelayEnvironmentProvider>
  );
}

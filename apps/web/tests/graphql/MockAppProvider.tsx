import { useRouter } from 'next/router';
import { PropsWithChildren, useState } from 'react';

import AppProvider from '~/contexts/AppProvider';
import GlobalLayoutContextProvider from '~/contexts/globalLayout/GlobalLayoutContext';
import { createRelayEnvironmentFromRecords } from '~/contexts/relay/RelayProvider';

export function MockAppProvider({ children }: PropsWithChildren) {
  const [relayEnvironment] = useState(() => createRelayEnvironmentFromRecords({}));
  const { query } = useRouter();

  const globalLayoutContextPreloadedQuery = GlobalLayoutContextProvider.preloadQuery?.({
    relayEnvironment,
    query,
  });

  if (!globalLayoutContextPreloadedQuery) {
    throw new Error('Preloaded Queries were not returned from preloadQuery function');
  }

  return (
    <AppProvider
      relayEnvironment={relayEnvironment}
      globalLayoutContextPreloadedQuery={globalLayoutContextPreloadedQuery}
    >
      {children}
    </AppProvider>
  );
}

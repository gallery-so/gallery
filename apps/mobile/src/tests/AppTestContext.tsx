import { NavigationContainer } from '@react-navigation/native';
import { PropsWithChildren, useState } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';

import { MobileAnalyticsProvider } from '~/contexts/MobileAnalyticsProvider';
import { createRelayEnvironment } from '~/contexts/relay/RelayProvider';

export function AppTestContext({ children }: PropsWithChildren) {
  const [relayEnvironment] = useState(() => createRelayEnvironment());

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <NavigationContainer>
        <MobileAnalyticsProvider>{children}</MobileAnalyticsProvider>
      </NavigationContainer>
    </RelayEnvironmentProvider>
  );
}

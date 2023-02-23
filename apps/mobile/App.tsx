import 'expo-dev-client';

import { NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RelayEnvironmentProvider } from 'react-relay';

import { MainTabNavigator } from '~/navigation/MainTabNavigator/MainTabNavigator';

import { createRelayEnvironment } from './src/contexts/relay/RelayProvider';

export default function App() {
  const [relayEnvironment] = useState(() => createRelayEnvironment());

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <SafeAreaProvider>
        <NavigationContainer>
          <MainTabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </RelayEnvironmentProvider>
  );
}

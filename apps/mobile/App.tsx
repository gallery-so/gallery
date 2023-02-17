import "expo-dev-client";

import { RelayEnvironmentProvider } from "react-relay";
import { useState } from "react";
import { createRelayEnvironment } from "./src/contexts/relay/RelayProvider";
import { NavigationContainer } from "@react-navigation/native";
import { MainTabNavigator } from "./src/navigation/MainTabNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";

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

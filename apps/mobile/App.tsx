import { RelayEnvironmentProvider } from "react-relay";
import { Suspense, useState } from "react";
import { createRelayEnvironment } from "./src/contexts/relay/RelayProvider";
import { Text } from "react-native";

export default function App() {
  const [relayEnvironment] = useState(() => createRelayEnvironment());

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <Suspense fallback={null}>
        <Text>Hello, World!</Text>
      </Suspense>
    </RelayEnvironmentProvider>
  );
}

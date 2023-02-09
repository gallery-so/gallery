import "expo-dev-client";

import { RelayEnvironmentProvider } from "react-relay";
import { Suspense, useState } from "react";
import { createRelayEnvironment } from "./src/contexts/relay/RelayProvider";
import { Gallery } from "./src/screens/Gallery";

export default function App() {
  const [relayEnvironment] = useState(() => createRelayEnvironment());

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <Suspense fallback={null}>
        <Gallery />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}

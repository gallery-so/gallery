import "expo-dev-client";

import { Suspense, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import {
  graphql,
  RelayEnvironmentProvider,
  useFragment,
  useLazyLoadQuery,
} from "react-relay";

import { AppDeferredDataQuery } from "~/generated/relay/AppDeferredDataQuery.graphql";
import { AppRobinFragment$key } from "~/generated/relay/AppRobinFragment.graphql";

import { createRelayEnvironment } from "./src/contexts/relay/RelayProvider";

function RobinUser({ queryRef }: { queryRef: AppRobinFragment$key }) {
  const query = useFragment(
    graphql`
      fragment AppRobinFragment on Query {
        userByUsername(username: "robin") {
          ... on GalleryUser {
            username
          }
        }
      }
    `,
    queryRef
  );

  return <Text>{query.userByUsername?.username}</Text>;
}

const QueryNode = graphql`
  query AppDeferredDataQuery {
    test: userByUsername(username: "xd") {
      __typename
    }
    ...AppRobinFragment @defer(label: "RobinFragment")
  }
`;

function DeferredData() {
  const query = useLazyLoadQuery<AppDeferredDataQuery>(QueryNode, {});

  return (
    <SafeAreaView>
      <Suspense fallback={<Text>Loading Robin...</Text>}>
        <RobinUser queryRef={query} />
      </Suspense>
    </SafeAreaView>
  );
}

export default function App() {
  const [relayEnvironment] = useState(() => createRelayEnvironment());

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <Suspense fallback={null}>
        <DeferredData />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}

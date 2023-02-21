import "expo-dev-client";

import {
  graphql,
  GraphQLTaggedNode,
  RelayEnvironmentProvider,
  useFragment,
  useLazyLoadQuery,
  useRelayEnvironment,
} from "react-relay";
import { Suspense, useEffect, useState } from "react";
import { createRelayEnvironment } from "./src/contexts/relay/RelayProvider";
import { AppDeferredDataQuery } from "~/generated/relay/AppDeferredDataQuery.graphql";
import { SafeAreaView, Text, View } from "react-native";
import { AppRobinFragment$key } from "~/generated/relay/AppRobinFragment.graphql";

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

function DeferredData() {
  const query = useLazyLoadQuery<AppDeferredDataQuery>(
    graphql`
      query AppDeferredDataQuery {
        test: userByUsername(username: "xd") {
          __typename
        }
        ...AppRobinFragment @defer(label: "RobinFragment")
      }
    `,
    {}
  );

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

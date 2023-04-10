import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { RootStackNavigatorQuery } from '~/generated/RootStackNavigatorQuery.graphql';
import { LoginStackNavigator } from '~/navigation/LoginStackNavigator';
import { MainTabNavigator } from '~/navigation/MainTabNavigator/MainTabNavigator';
import { RootStackNavigatorParamList } from '~/navigation/types';
import { NftDetailScreen } from '~/screens/NftDetailScreen/NftDetailScreen';

const Stack = createNativeStackNavigator<RootStackNavigatorParamList>();

export function RootStackNavigator() {
  const query = useLazyLoadQuery<RootStackNavigatorQuery>(
    graphql`
      query RootStackNavigatorQuery {
        viewer {
          ... on Viewer {
            __typename
            notifications(last: 1) @connection(key: "RootStackNavigatorFragment_notifications") {
              unseenCount
              # Relay requires that we grab the edges field if we use the connection directive
              # We're selecting __typename since that shouldn't have a cost
              # eslint-disable-next-line relay/unused-fields
              edges {
                __typename
              }
            }
          }
        }
      }
    `,
    {}
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const hasUnreadNotifications = useMemo(() => {
    if (query.viewer && query.viewer.__typename === 'Viewer') {
      return (query.viewer?.notifications?.unseenCount ?? 0) > 0;
    }

    return false;
  }, [query.viewer]);

  return (
    <Stack.Navigator
      screenOptions={{ header: Empty }}
      initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'}
    >
      <Stack.Screen name="Login" component={LoginStackNavigator} />
      <Stack.Screen name="MainTabs">
        {() => <MainTabNavigator hasUnreadNotifications={hasUnreadNotifications} />}
      </Stack.Screen>
      <Stack.Screen name="NftDetail" component={NftDetailScreen} />
    </Stack.Navigator>
  );
}

function Empty() {
  return null;
}

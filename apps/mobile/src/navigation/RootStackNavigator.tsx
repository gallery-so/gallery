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
          }
        }
      }
    `,
    {}
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  return (
    <Stack.Navigator
      screenOptions={{ header: Empty }}
      initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'}
    >
      <Stack.Screen name="Login" component={LoginStackNavigator} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="NftDetail" component={NftDetailScreen} />
    </Stack.Navigator>
  );
}

function Empty() {
  return null;
}

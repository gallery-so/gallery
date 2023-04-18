import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { RootStackNavigatorQuery } from '~/generated/RootStackNavigatorQuery.graphql';
import { LoginStackNavigator } from '~/navigation/LoginStackNavigator';
import { MainTabNavigator } from '~/navigation/MainTabNavigator/MainTabNavigator';
import { RootStackNavigatorParamList } from '~/navigation/types';
import { NftDetailScreen } from '~/screens/NftDetailScreen/NftDetailScreen';
import { ProfileQRCodeScreen } from '~/screens/ProfileQRCodeScreen';
import { ProfileScreen } from '~/screens/ProfileScreen/ProfileScreen';

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
      // initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'}
      initialRouteName="ProfileQRCode"
    >
      <Stack.Screen name="Login" component={LoginStackNavigator} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="NftDetail" component={NftDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="ProfileQRCode"
        options={{ presentation: 'modal' }}
        initialParams={{ username: 'b_ez_man' }}
        component={ProfileQRCodeScreen}
      />
    </Stack.Navigator>
  );
}

function Empty() {
  return null;
}

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { RootStackNavigatorQuery } from '~/generated/RootStackNavigatorQuery.graphql';
import { LoginStackNavigator } from '~/navigation/LoginStackNavigator';
import { MainTabNavigator } from '~/navigation/MainTabNavigator/MainTabNavigator';
import { RootStackNavigatorParamList } from '~/navigation/types';
import { TwitterSuggestionListScreen } from '~/screens/HomeScreen/TwitterSuggestionListScreen';
import { UserSuggestionListScreen } from '~/screens/HomeScreen/UserSuggestionListScreen';
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
      initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'}
    >
      <Stack.Screen name="Login" component={LoginStackNavigator} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="NftDetail" component={NftDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="ProfileQRCode"
        options={{ presentation: 'modal' }}
        component={ProfileQRCodeScreen}
      />
      <Stack.Screen
        name="UserSuggestionList"
        options={{
          presentation: 'modal',
        }}
        component={UserSuggestionListScreen}
      />
      <Stack.Screen
        name="TwitterSuggestionList"
        options={{
          presentation: 'modal',
        }}
        component={TwitterSuggestionListScreen}
      />
    </Stack.Navigator>
  );
}

function Empty() {
  return null;
}

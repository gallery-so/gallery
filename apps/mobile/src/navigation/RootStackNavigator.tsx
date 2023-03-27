import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabNavigator } from '~/navigation/MainTabNavigator/MainTabNavigator';

import { NftDetailScreen } from '../screens/NftDetailScreen/NftDetailScreen';

const Stack = createNativeStackNavigator();

export function RootStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ header: Empty }} initialRouteName="MainTabs">
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="NftDetail"
        options={{ presentation: 'modal' }}
        component={NftDetailScreen}
      />
    </Stack.Navigator>
  );
}

function Empty() {
  return null;
}

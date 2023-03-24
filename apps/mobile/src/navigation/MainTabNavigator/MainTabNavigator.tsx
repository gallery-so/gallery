import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccountScreen } from 'src/screens/AccountScreen';
import { NotificationsScreen } from 'src/screens/NotificationsScreen';

import { TabBar } from '~/navigation/MainTabNavigator/TabBar';
import { MainTabNavigatorParamList } from '~/navigation/types';

import { HomeScreen } from '../../screens/HomeScreen/HomeScreen';

const Tab = createMaterialTopTabNavigator<MainTabNavigatorParamList>();

export function MainTabNavigator() {
  const { top } = useSafeAreaInsets();

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      initialRouteName="Home"
      tabBar={TabBar}
      screenOptions={{ swipeEnabled: false }}
      sceneContainerStyle={{ paddingTop: top, backgroundColor: 'white' }}
    >
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

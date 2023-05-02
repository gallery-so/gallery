import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useColorScheme } from 'react-native';

import { TabBar } from '~/navigation/MainTabNavigator/TabBar';
import { MainTabStackNavigator } from '~/navigation/MainTabStackNavigator';
import { MainTabNavigatorParamList } from '~/navigation/types';
import colors from '~/shared/theme/colors';

const Tab = createMaterialTopTabNavigator<MainTabNavigatorParamList>();

function AccountScreen() {
  return <MainTabStackNavigator initialRouteName="Account" />;
}

function HomeScreen() {
  return <MainTabStackNavigator initialRouteName="Profile" />;
}

function SearchScreen() {
  return <MainTabStackNavigator initialRouteName="Search" />;
}

function NotificationsScreen() {
  return <MainTabStackNavigator initialRouteName="Notifications" />;
}

export function MainTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      initialRouteName="HomeTab"
      tabBar={TabBar}
      screenOptions={{ swipeEnabled: false }}
      sceneContainerStyle={{
        backgroundColor: colorScheme === 'dark' ? colors.black : colors.white,
      }}
    >
      <Tab.Screen name="AccountTab" component={AccountScreen} />
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="SearchTab" component={SearchScreen} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

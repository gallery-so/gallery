import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useColorScheme } from 'react-native';

import { LoggedInStackNavigator } from '~/navigation/LoggedInStackNavigator';
import { TabBar } from '~/navigation/MainTabNavigator/TabBar';
import { MainTabNavigatorParamList } from '~/navigation/types';
import colors from '~/shared/theme/colors';

const Tab = createMaterialTopTabNavigator<MainTabNavigatorParamList>();

function AccountScreen() {
  return <LoggedInStackNavigator initialRouteName="Account" />;
}

function HomeScreen() {
  return <LoggedInStackNavigator initialRouteName="Home" />;
}

function SearchScreen() {
  return <LoggedInStackNavigator initialRouteName="Search" />;
}

function NotificationsScreen() {
  return <LoggedInStackNavigator initialRouteName="Notifications" />;
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

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccountScreen } from 'src/screens/AccountScreen';
import { NotificationsScreen } from 'src/screens/NotificationsScreen';
import { SearchScreen } from 'src/screens/SearchScreen';

import { TabBar } from '~/navigation/MainTabNavigator/TabBar';
import { MainTabNavigatorParamList } from '~/navigation/types';
import colors from '~/shared/theme/colors';

import { HomeScreen } from '../../screens/HomeScreen/HomeScreen';

const Tab = createMaterialTopTabNavigator<MainTabNavigatorParamList>();

export function MainTabNavigator() {
  const { top } = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      initialRouteName="Home"
      tabBar={TabBar}
      screenOptions={{ swipeEnabled: false }}
      sceneContainerStyle={{
        paddingTop: top,
        backgroundColor: colorScheme === 'dark' ? colors.offBlack : colors.white,
      }}
    >
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

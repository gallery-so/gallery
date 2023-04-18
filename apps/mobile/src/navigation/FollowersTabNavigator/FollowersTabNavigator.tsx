import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { FollowersTabNavigatorParamList } from '~/navigation/types';
import { FollowersScreen } from '~/screens/ProfileScreen/Tabs/Followers/FollowersScreen';
import { FollowingScreen } from '~/screens/ProfileScreen/Tabs/Followers/FollowingScreen';

import { TabBar } from './TabBar';

const Tab = createMaterialTopTabNavigator<FollowersTabNavigatorParamList>();

export function FollowersTabNavigator() {
  return (
    <Tab.Navigator
      tabBarPosition="top"
      initialRouteName="FollowersList"
      tabBar={TabBar}
      sceneContainerStyle={{ backgroundColor: 'white' }}
    >
      <Tab.Screen name="FollowersList" component={FollowersScreen} />
      <Tab.Screen name="FollowingList" component={FollowingScreen} />
    </Tab.Navigator>
  );
}

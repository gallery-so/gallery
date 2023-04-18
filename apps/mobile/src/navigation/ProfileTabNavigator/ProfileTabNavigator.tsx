import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { ProfileTabNavigatorParamList } from '~/navigation/types';
import { ActivityScreen } from '~/screens/ProfileScreen/Tabs/ActivityScreen';
import { FeaturedScreen } from '~/screens/ProfileScreen/Tabs/FeaturedScreen';
import { FollowersScreen } from '~/screens/ProfileScreen/Tabs/FollowersScreen';
import { GalleriesScreen } from '~/screens/ProfileScreen/Tabs/GalleriesScreen';

import { TabBar } from './TabBar';

const Tab = createMaterialTopTabNavigator<ProfileTabNavigatorParamList>();

export function ProfileTabNavigator() {
  return (
    <Tab.Navigator
      tabBarPosition="top"
      initialRouteName="Featured"
      tabBar={TabBar}
      sceneContainerStyle={{ backgroundColor: 'white', marginTop: 16 }}
    >
      <Tab.Screen name="Featured" component={FeaturedScreen} />
      <Tab.Screen name="Galleries" component={GalleriesScreen} />
      <Tab.Screen name="Followers" component={FollowersScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
    </Tab.Navigator>
  );
}

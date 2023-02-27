import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { TabBar } from '~/navigation/FeedTabNavigator/TabBar';
import { FeedTabNavigatorParamList } from '~/navigation/types';

import { FeaturedScreen } from '../../screens/FeaturedScreen';
import { LatestScreen } from '../../screens/LatestScreen';
import { TrendingScreen } from '../../screens/TrendingScreen';

const Tab = createMaterialTopTabNavigator<FeedTabNavigatorParamList>();

export function FeedTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ swipeEnabled: false }}
      tabBarPosition="top"
      initialRouteName="Featured"
      tabBar={TabBar}
      sceneContainerStyle={{ backgroundColor: 'white' }}
    >
      <Tab.Screen name="Trending" component={TrendingScreen} />
      <Tab.Screen name="Latest" component={LatestScreen} />
      <Tab.Screen name="Featured" component={FeaturedScreen} />
    </Tab.Navigator>
  );
}

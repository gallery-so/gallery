import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { TabBar } from '~/navigation/FeedTabNavigator/TabBar';
import { FeedTabNavigatorParamList } from '~/navigation/types';
import { ExploreScreen } from '~/screens/HomeScreen/ExploreScreen';

import { LatestScreen } from '../../screens/HomeScreen/LatestScreen';
import { TrendingScreen } from '../../screens/HomeScreen/TrendingScreen';

const Tab = createMaterialTopTabNavigator<FeedTabNavigatorParamList>();

export function FeedTabNavigator() {
  return (
    <Tab.Navigator
      tabBarPosition="top"
      initialRouteName="Latest"
      tabBar={TabBar}
      sceneContainerStyle={{ backgroundColor: 'white' }}
    >
      <Tab.Screen name="Trending" component={TrendingScreen} />
      <Tab.Screen name="Latest" component={LatestScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
    </Tab.Navigator>
  );
}

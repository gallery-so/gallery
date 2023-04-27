import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useColorScheme } from 'react-native';

import { TabBar } from '~/navigation/FeedTabNavigator/TabBar';
import { FeedTabNavigatorParamList } from '~/navigation/types';
import colors from '~/shared/theme/colors';
import { ExploreScreen } from '~/screens/HomeScreen/ExploreScreen';

import { LatestScreen } from '../../screens/HomeScreen/LatestScreen';
import { TrendingScreen } from '../../screens/HomeScreen/TrendingScreen';

const Tab = createMaterialTopTabNavigator<FeedTabNavigatorParamList>();

export function FeedTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      tabBarPosition="top"
      initialRouteName="Latest"
      tabBar={TabBar}
      sceneContainerStyle={{
        backgroundColor: colorScheme === 'dark' ? "#000000" : colors.white, // todo use variable
      }}
    >
      <Tab.Screen name="Trending" component={TrendingScreen} />
      <Tab.Screen name="Latest" component={LatestScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
    </Tab.Navigator>
  );
}

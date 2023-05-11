import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useColorScheme } from 'react-native';

import { TabBar } from '~/navigation/FeedTabNavigator/TabBar';
import { FeedTabNavigatorParamList } from '~/navigation/types';
import { ExploreScreen } from '~/screens/HomeScreen/ExploreScreen';
import colors from '~/shared/theme/colors';

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
      screenOptions={{ lazy: true }}
      sceneContainerStyle={{
        backgroundColor: colorScheme === 'dark' ? colors.black : colors.white,
      }}
    >
      <Tab.Screen name="Trending" component={TrendingScreen} />
      <Tab.Screen name="Latest" component={LatestScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
    </Tab.Navigator>
  );
}

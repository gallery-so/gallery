import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useColorScheme } from 'nativewind';

import { TabBar } from '~/navigation/FeedTabNavigator/TabBar';
import { FeedTabNavigatorParamList } from '~/navigation/types';
import { ExploreScreen } from '~/screens/HomeScreen/ExploreScreen';
import colors from '~/shared/theme/colors';

import { CuratedScreen } from '../../screens/HomeScreen/CuratedScreen';
import { LatestScreen } from '../../screens/HomeScreen/LatestScreen';

const Tab = createMaterialTopTabNavigator<FeedTabNavigatorParamList>();

export function FeedTabNavigator() {
  const { colorScheme } = useColorScheme();

  return (
    <Tab.Navigator
      tabBarPosition="top"
      initialRouteName="Curated"
      tabBar={TabBar}
      screenOptions={{ lazy: true, swipeEnabled: false, animationEnabled: false }}
      sceneContainerStyle={{
        backgroundColor: colorScheme === 'dark' ? colors.black['900'] : colors.white,
      }}
    >
      <Tab.Screen name="Curated" component={CuratedScreen} />
      <Tab.Screen name="Latest" component={LatestScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
    </Tab.Navigator>
  );
}

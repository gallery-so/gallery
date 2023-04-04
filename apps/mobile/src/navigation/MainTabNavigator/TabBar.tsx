import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { ReactNode, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountIcon } from '~/navigation/MainTabNavigator/AccountIcon';
import { GLogo } from '~/navigation/MainTabNavigator/GLogo';
import { NotificationsIcon } from '~/navigation/MainTabNavigator/NotificationsIcon';
import { MainTabNavigatorParamList, MainTabNavigatorProp } from '~/navigation/types';

import { SearchIcon } from './SearchIcon';

type TabItemProps = {
  activeRoute: keyof MainTabNavigatorParamList;
  route: keyof MainTabNavigatorParamList;
  icon: ReactNode;
};

function TabItem({ route, icon, activeRoute }: TabItemProps) {
  const navigation = useNavigation<MainTabNavigatorProp>();

  const isFocused = activeRoute === route;

  const onPress = useCallback(() => {
    if (!isFocused) {
      if (route === 'Home') {
        navigation.navigate(route, { screen: 'Trending' });
      } else {
        navigation.navigate(route);
      }
    }
  }, [isFocused, navigation, route]);

  return (
    <TouchableOpacity
      className={`px-8 ${isFocused ? 'opacity-100' : 'opacity-25'}`}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
    >
      {icon}
    </TouchableOpacity>
  );
}

export function TabBar({ state }: MaterialTopTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  const activeRoute = state.routeNames[state.index] as keyof MainTabNavigatorParamList;

  const hasSafeAreaIntersection = bottom !== 0;
  return (
    <View
      style={
        hasSafeAreaIntersection
          ? { paddingBottom: bottom, paddingTop: 12 }
          : { paddingBottom: 12, paddingTop: 12 }
      }
      className="bg-offWhite flex flex-row items-center justify-center"
    >
      <TabItem activeRoute={activeRoute} route="Account" icon={<AccountIcon />} />
      <TabItem activeRoute={activeRoute} route="Home" icon={<GLogo />} />
      <TabItem activeRoute={activeRoute} route="Search" icon={<SearchIcon />} />
      <TabItem activeRoute={activeRoute} route="Notifications" icon={<NotificationsIcon />} />
    </View>
  );
}

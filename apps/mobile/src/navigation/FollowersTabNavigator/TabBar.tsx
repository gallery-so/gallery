import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { NavigationRoute } from '@sentry/react-native/dist/js/tracing/reactnavigation';
import { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { FeedTabNavigatorParamList } from '~/navigation/types';

import { Typography } from '../../components/Typography';

type TabItemProps = {
  navigation: MaterialTopTabBarProps['navigation'];
  activeRoute: keyof FeedTabNavigatorParamList;
  route: NavigationRoute;
};

function TabItem({ navigation, route, activeRoute }: TabItemProps) {
  const isFocused = activeRoute === route.name;

  const onPress = useCallback(() => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  }, [isFocused, navigation, route]);

  let name = '';
  if (route.name === 'FollowingList') {
    name = 'Following';
  } else if (route.name === 'FollowersList') {
    name = 'Followers';
  }

  return (
    <TouchableOpacity
      className={`px-2`}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
    >
      <Typography
        className={`text-sm ${isFocused ? 'text-offBlack' : 'text-metal'}`}
        font={{ family: 'ABCDiatype', weight: 'Medium' }}
      >
        {name}
      </Typography>
    </TouchableOpacity>
  );
}

export function TabBar({ navigation, state }: MaterialTopTabBarProps) {
  const activeRoute = state.routeNames[state.index] as keyof FeedTabNavigatorParamList;

  return (
    <View className="flex flex-row items-center justify-center px-3 py-3">
      {state.routes.map((route) => {
        return (
          <TabItem
            route={route}
            key={route.key}
            navigation={navigation}
            activeRoute={activeRoute}
          />
        );
      })}
    </View>
  );
}

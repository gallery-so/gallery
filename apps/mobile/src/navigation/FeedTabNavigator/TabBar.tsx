import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { NavigationRoute } from '@sentry/react-native/dist/js/tracing/reactnavigation';
import { useCallback } from 'react';
import { View } from 'react-native';

import { FeedbackButton } from '~/components/FeedbackButton';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
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

  return (
    <GalleryTouchableOpacity
      className={`px-2`}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      eventElementId="Navigation Tab Item"
      eventName="Navigation Tab Item Clicked"
      properties={{ variant: 'Feed', route: route.name }}
    >
      <Typography
        className={`text-lg tracking-tight ${
          isFocused ? 'text-black-800 dark:text-white' : 'text-metal dark:text-metal'
        }`}
        font={{ family: 'ABCDiatype', weight: 'Medium' }}
      >
        {route.name}
      </Typography>
    </GalleryTouchableOpacity>
  );
}

export function TabBar({ navigation, state }: MaterialTopTabBarProps) {
  const activeRoute = state.routeNames[state.index] as keyof FeedTabNavigatorParamList;

  return (
    <View className="relative flex flex-row items-center justify-center px-4 py-3">
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

      <View className="absolute right-0 px-4">
        <FeedbackButton />
      </View>
    </View>
  );
}

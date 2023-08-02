import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { NavigationRoute } from '@sentry/react-native/dist/js/tracing/reactnavigation';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { ReactNode, Suspense, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { TabBarLazyNotificationBlueDotQuery } from '~/generated/TabBarLazyNotificationBlueDotQuery.graphql';
import { GLogo } from '~/navigation/MainTabNavigator/GLogo';
import { NotificationsIcon } from '~/navigation/MainTabNavigator/NotificationsIcon';
import { SearchIcon } from '~/navigation/MainTabNavigator/SearchIcon';
import { MainTabNavigatorParamList } from '~/navigation/types';
import colors from '~/shared/theme/colors';

import { AccountIcon } from '../../icons/AccountIcon';
import { SettingsIcon } from '../../icons/SettingsIcon';
import { PostIcon } from './PostIcon';

type TabItemProps = {
  icon: ReactNode;
  route: NavigationRoute;
  activeRoute: keyof MainTabNavigatorParamList;
  navigation: MaterialTopTabBarProps['navigation'];
};

function TabItem({ navigation, route, icon, activeRoute }: TabItemProps) {
  const [isPressed, setIsPressed] = useState(false);

  const isFocused = activeRoute === route.name;

  const handleOnPressIn = useCallback(() => {
    if (route.name === 'PostTab') {
      return;
    }
    setIsPressed(true);
  }, [route.name]);

  const handleOnPressOut = useCallback(() => {
    setIsPressed(false);
  }, []);

  const onPress = useCallback(() => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (route.name === 'PostTab') {
      navigation.navigate('Post', {
        screen: 'Post',
      });
    } else {
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    }
  }, [isFocused, navigation, route]);

  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      activeOpacity={1}
      className="pt-3 px-4 flex items-center justify-center"
      eventElementId="Navigation Tab Item"
      eventName="Navigation Tab Item Clicked"
      properties={{ variant: 'Main', route: route.name }}
      onPressIn={handleOnPressIn}
      onPressOut={handleOnPressOut}
    >
      <View
        className={clsx(`px-0 flex h-8 w-8 items-center justify-center rounded-full`, {
          'border border-black dark:border-white ': isFocused && route.name !== 'PostTab',
          'bg-faint dark:bg-[#2B2B2B]': isPressed,
        })}
      >
        {icon}
      </View>
    </GalleryTouchableOpacity>
  );
}

type TabBarProps = MaterialTopTabBarProps;

export function TabBar({ state, navigation }: TabBarProps) {
  const { bottom } = useSafeAreaInsets();

  const activeRoute = state.routeNames[state.index] as keyof MainTabNavigatorParamList;

  const hasSafeAreaIntersection = bottom !== 0;
  const { colorScheme } = useColorScheme();

  return (
    <View
      style={hasSafeAreaIntersection ? { paddingBottom: bottom } : { paddingBottom: 12 }}
      className="bg-white dark:bg-black-900 flex flex-row items-center justify-evenly border-t border-porcelain dark:border-black-600"
    >
      {state.routes.map((route) => {
        let icon = null;
        if (route.name === 'AccountTab') {
          icon = <AccountIcon />;
        } else if (route.name === 'HomeTab') {
          icon = <GLogo />;
        } else if (route.name === 'NotificationsTab') {
          icon = <LazyNotificationIcon />;
        } else if (route.name === 'SearchTab') {
          icon = <SearchIcon />;
        } else if (route.name === 'SettingsTab') {
          icon = <SettingsIcon />;
        } else if (route.name === 'PostTab') {
          icon = <PostIcon color={colorScheme === 'dark' ? colors.white : colors.black['800']} />;
        }

        return (
          <TabItem
            icon={icon}
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

function LazyNotificationBlueDot() {
  const query = useLazyLoadQuery<TabBarLazyNotificationBlueDotQuery>(
    graphql`
      query TabBarLazyNotificationBlueDotQuery {
        viewer {
          ... on Viewer {
            __typename
            notifications(last: 1) @connection(key: "TabBarMainTabNavigator_notifications") {
              unseenCount
              # Relay requires that we grab the edges field if we use the connection directive
              # We're selecting __typename since that shouldn't have a cost
              # eslint-disable-next-line relay/unused-fields
              edges {
                __typename
              }
            }
          }
        }
      }
    `,
    {}
  );

  const hasUnreadNotifications = useMemo(() => {
    if (query.viewer && query.viewer.__typename === 'Viewer') {
      return (query.viewer?.notifications?.unseenCount ?? 0) > 0;
    }

    return false;
  }, [query.viewer]);

  if (hasUnreadNotifications) {
    return <View className="bg-activeBlue absolute right-0 top-0 h-2 w-2 rounded-full" />;
  }

  return null;
}

function LazyNotificationIcon() {
  return (
    <View className="relative">
      <NotificationsIcon />

      {/* Don't show the blue dot until we've loaded notifications lazily */}
      <Suspense fallback={null}>
        <LazyNotificationBlueDot />
      </Suspense>
    </View>
  );
}

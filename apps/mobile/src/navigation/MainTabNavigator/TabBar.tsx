import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { NavigationRoute } from '@sentry/react-native/dist/js/tracing/reactnavigation';
import { ReactNode, useCallback, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useFragment } from 'react-relay';

import { TabBarFragment$key } from '~/generated/TabBarFragment.graphql';
import { AccountIcon } from '~/navigation/MainTabNavigator/AccountIcon';
import { GLogo } from '~/navigation/MainTabNavigator/GLogo';
import { NotificationsIcon } from '~/navigation/MainTabNavigator/NotificationsIcon';
import { MainTabNavigatorParamList } from '~/navigation/types';

type TabItemProps = {
  icon: ReactNode;
  route: NavigationRoute;
  activeRoute: keyof MainTabNavigatorParamList;
  navigation: MaterialTopTabBarProps['navigation'];
};

function TabItem({ navigation, route, icon, activeRoute }: TabItemProps) {
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
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      className={`px-8 ${isFocused ? 'opacity-100' : 'opacity-25'}`}
    >
      {icon}
    </TouchableOpacity>
  );
}

type TabBarProps = MaterialTopTabBarProps & {
  queryRef: TabBarFragment$key;
};

export function TabBar({ state, navigation, queryRef }: TabBarProps) {
  const query = useFragment(
    graphql`
      fragment TabBarFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            notifications(last: 1) @connection(key: "TabBarFragment_notifications") {
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
    queryRef
  );

  const { bottom } = useSafeAreaInsets();

  const activeRoute = state.routeNames[state.index] as keyof MainTabNavigatorParamList;

  const hasSafeAreaIntersection = bottom !== 0;

  const hasUnreadNotifications = useMemo(() => {
    if (query.viewer && query.viewer.__typename === 'Viewer') {
      return (query.viewer?.notifications?.unseenCount ?? 0) > 0;
    }
  }, [query.viewer]);

  return (
    <View
      style={
        hasSafeAreaIntersection
          ? { paddingBottom: bottom, paddingTop: 12 }
          : { paddingBottom: 12, paddingTop: 12 }
      }
      className="bg-offWhite flex flex-row items-center justify-center"
    >
      {state.routes.map((route) => {
        let icon = null;
        if (route.name === 'Account') {
          icon = <AccountIcon />;
        } else if (route.name === 'Home') {
          icon = <GLogo />;
        } else if (route.name === 'Notifications') {
          icon = (
            <View className="relative">
              <NotificationsIcon />
              {hasUnreadNotifications && (
                <View className="bg-activeBlue absolute right-0 top-0 h-2 w-2 rounded-full" />
              )}
            </View>
          );
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

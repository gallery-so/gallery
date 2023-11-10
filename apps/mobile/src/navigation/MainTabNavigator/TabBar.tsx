import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { NavigationRoute } from '@sentry/react-native/dist/js/tracing/reactnavigation';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { ReactNode, Suspense, useCallback, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { TabBarLazyPostIconQuery } from '~/generated/TabBarLazyPostIconQuery.graphql';
import { TabBarLazyProfilePictureQuery } from '~/generated/TabBarLazyProfilePictureQuery.graphql';
import { GLogo } from '~/navigation/MainTabNavigator/GLogo';
import { NotificationsIcon } from '~/navigation/MainTabNavigator/NotificationsIcon';
import { SearchIcon } from '~/navigation/MainTabNavigator/SearchIcon';
import { MainTabNavigatorParamList } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { noop } from '~/shared/utils/noop';

import { AccountIcon } from '../../icons/AccountIcon';
import { SettingsIcon } from '../../icons/SettingsIcon';
import { LazyNotificationBlueDot } from './NotificationBlueDot';
import { PostIcon } from './PostIcon';

type TabItemProps = {
  icon: ReactNode;
  route: NavigationRoute;
  activeRoute: keyof MainTabNavigatorParamList;
  navigation: MaterialTopTabBarProps['navigation'];
  onPressOverride?: () => void;
  ignoreActiveState?: boolean;
};

function TabItem({
  navigation,
  route,
  icon,
  activeRoute,
  onPressOverride,
  ignoreActiveState = false,
}: TabItemProps) {
  const [isPressed, setIsPressed] = useState(false);

  const isFocused = activeRoute === route.name;

  const handleOnPressIn = useCallback(() => {
    if (ignoreActiveState) {
      return;
    }
    setIsPressed(true);
  }, [ignoreActiveState]);

  const handleOnPressOut = useCallback(() => {
    setIsPressed(false);
  }, []);

  const onPress = useCallback(() => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (onPressOverride) {
      onPressOverride();
    } else if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  }, [navigation, route.key, route.name, onPressOverride, isFocused]);

  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      activeOpacity={1}
      className="pt-3 px-4 flex items-center justify-center"
      eventElementId="Navigation Tab Item"
      eventName="Navigation Tab Item Clicked"
      eventContext={contexts.Navigation}
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
          icon = <LazyAccountTabItem />;
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

        if (route.name === 'PostTab') {
          return (
            <LazyPostTabItem
              key={route.key}
              icon={
                <PostIcon color={colorScheme === 'dark' ? colors.white : colors.black['800']} />
              }
              {...{ navigation, route, activeRoute }}
            />
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

function LazyAccountTabItem() {
  return (
    <Suspense fallback={<AccountIcon />}>
      <LazyAccountIcon />
    </Suspense>
  );
}

function LazyAccountIcon() {
  const query = useLazyLoadQuery<TabBarLazyProfilePictureQuery>(
    graphql`
      query TabBarLazyProfilePictureQuery {
        viewer {
          ... on Viewer {
            user {
              ...ProfilePictureFragment
            }
          }
        }
      }
    `,
    {}
  );

  const user = query.viewer?.user;

  return user ? <ProfilePicture userRef={user} size="sm" /> : null;
}

function LazyPostTabItem(props: TabItemProps) {
  return (
    <Suspense
      fallback={
        <TabItem
          {...props}
          // we don't immediately know the callback handler for the Post icon;
          // this will be lazily determined
          onPressOverride={noop}
          ignoreActiveState
        />
      }
    >
      <LazyPostIcon {...props} />
    </Suspense>
  );
}

function LazyPostIcon(props: TabItemProps) {
  const query = useLazyLoadQuery<TabBarLazyPostIconQuery>(
    graphql`
      query TabBarLazyPostIconQuery {
        viewer {
          ... on Viewer {
            user {
              __typename
              primaryWallet {
                __typename
              }
            }
          }
        }
      }
    `,
    {}
  );

  const userHasWallet = query.viewer?.user?.primaryWallet?.__typename === 'Wallet';

  const { openManageWallet } = useManageWalletActions();

  const handlePressOverride = useCallback(() => {
    if (userHasWallet) {
      props.navigation.navigate('PostNftSelector', {
        screen: 'Post',
        fullScreen: true,
      });
      return;
    }

    openManageWallet({
      title: 'You need to connect a wallet to post',
      onSuccess: () => {
        props.navigation.navigate('PostNftSelector', {
          screen: 'Post',
          fullScreen: true,
        });
      },
    });
  }, [openManageWallet, props.navigation, userHasWallet]);

  return <TabItem {...props} onPressOverride={handlePressOverride} ignoreActiveState />;
}

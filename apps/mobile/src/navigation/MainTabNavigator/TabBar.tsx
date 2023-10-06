import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { NavigationRoute } from '@sentry/react-native/dist/js/tracing/reactnavigation';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { ReactNode, Suspense, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { TabBarLazyNotificationBlueDotQuery } from '~/generated/TabBarLazyNotificationBlueDotQuery.graphql';
import { TabBarQuery } from '~/generated/TabBarQuery.graphql';
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

  hasWallet?: boolean;
};

function TabItem({ navigation, route, icon, activeRoute, hasWallet }: TabItemProps) {
  const [isPressed, setIsPressed] = useState(false);

  const isFocused = activeRoute === route.name;

  const { openManageWallet } = useManageWalletActions();

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
      hasWallet
        ? navigation.navigate('PostNftSelector', {
            screen: 'Post',
            fullScreen: true,
          })
        : openManageWallet({
            title: 'You need to connect a wallet to post',
            onSuccess: () => {
              navigation.navigate('PostNftSelector', {
                screen: 'Post',
                fullScreen: true,
              });
            },
          });
    } else {
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    }
  }, [hasWallet, isFocused, openManageWallet, navigation, route]);

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
  const query = useLazyLoadQuery<TabBarQuery>(
    graphql`
      query TabBarQuery {
        viewer {
          ... on Viewer {
            user {
              bio
              username
              primaryWallet {
                __typename
              }

              profileImage {
                ... on TokenProfileImage {
                  token {
                    media {
                      ... on Media {
                        previewURLs {
                          small
                        }
                      }
                    }
                  }
                }
                ... on EnsProfileImage {
                  __typename
                  profileImage {
                    __typename
                    previewURLs {
                      small
                    }
                  }
                }
              }

              ...ProfilePictureFragment
            }
          }
        }
      }
    `,
    {}
  );

  const user = query.viewer?.user;

  const { token, profileImage: ensImage } = user?.profileImage ?? {};
  const imageUrl = token?.media?.previewURLs?.small ?? ensImage?.previewURLs?.small;
  console.log('imageUrl', imageUrl);

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
          icon = user && imageUrl ? <ProfilePicture userRef={user} size="sm" /> : <AccountIcon />;
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

function LazyPostTabItem(props: TabItemProps) {
  return (
    <Suspense fallback={null}>
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

  return <TabItem {...props} hasWallet={userHasWallet} />;
}

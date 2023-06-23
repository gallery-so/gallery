import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useColorScheme } from 'nativewind';
import { Suspense } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { ProfileViewFallback } from '~/components/ProfileView/ProfileViewFallback';
import { MainTabNavigatorAccountScreenQuery } from '~/generated/MainTabNavigatorAccountScreenQuery.graphql';
import { TabBar } from '~/navigation/MainTabNavigator/TabBar';
import { MainTabStackNavigator } from '~/navigation/MainTabStackNavigator';
import { MainTabNavigatorParamList } from '~/navigation/types';
import colors from '~/shared/theme/colors';

const Tab = createMaterialTopTabNavigator<MainTabNavigatorParamList>();

function AccountScreenInner() {
  const query = useLazyLoadQuery<MainTabNavigatorAccountScreenQuery>(
    graphql`
      query MainTabNavigatorAccountScreenQuery {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    {},
    { fetchPolicy: 'network-only' }
  );

  return (
    <MainTabStackNavigator
      initialRouteName="Profile"
      initialProfileParams={{ username: query.viewer?.user?.username ?? '', hideBackButton: true }}
    />
  );
}

function AccountScreen() {
  return (
    <Suspense fallback={<ProfileViewFallback shouldShowBackButton={false} />}>
      <AccountScreenInner />
    </Suspense>
  );
}

function HomeScreen() {
  return <MainTabStackNavigator initialRouteName="Home" />;
}

function SearchScreen() {
  return <MainTabStackNavigator initialRouteName="Search" />;
}

function NotificationsScreen() {
  return <MainTabStackNavigator initialRouteName="Notifications" />;
}

function SettingsScreen() {
  return <MainTabStackNavigator initialRouteName="Settings" />;
}

export function MainTabNavigator() {
  const { colorScheme } = useColorScheme();

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      initialRouteName="HomeTab"
      tabBar={TabBar}
      screenOptions={{ swipeEnabled: false, animationEnabled: false, lazy: true }}
      sceneContainerStyle={{
        backgroundColor: colorScheme === 'dark' ? colors.black.DEFAULT : colors.white,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      {/* <Tab.Screen name="SearchTab" component={SearchScreen} /> */}
      {/* <Tab.Screen name="NotificationsTab" component={NotificationsScreen} /> */}
      {/* <Tab.Screen name="AccountTab" component={AccountScreen} /> */}
      {/* <Tab.Screen name="SettingsTab" component={SettingsScreen} /> */}
    </Tab.Navigator>
  );
}

import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';

export type FeedTabNavigatorParamList = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  Trending: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  Latest: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  Featured: {};
};

export type MainTabNavigatorParamList = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  Account: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  Home: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  Notifications: {};
};

export type MainTabNavigatorProp = MaterialTopTabNavigationProp<MainTabNavigatorParamList>;
export type FeedTabNavigatorProp = MaterialTopTabNavigationProp<FeedTabNavigatorParamList>;

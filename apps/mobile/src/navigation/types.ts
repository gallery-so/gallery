import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';

export type MainTabNavigatorParamList = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  Account: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  Home: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  Notifications: {};
};

export type MainTabNavigatorProp = MaterialTopTabNavigationProp<MainTabNavigatorParamList>;

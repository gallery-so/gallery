import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { CompositeNavigationProp, CompositeScreenProps } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeStackNavigatorProps } from 'react-native-screens/lib/typescript/native-stack/types';

export type RootStackNavigatorParamList = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  MainTabs: {};
  NftDetail: {
    tokenId: string;
  };
};

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

export type RootStackNavigatorProp = NativeStackNavigationProp<RootStackNavigatorParamList>;

export type MainTabNavigatorProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackNavigatorParamList, 'MainTabs'>,
  MaterialTopTabNavigationProp<MainTabNavigatorParamList>
>;

export type FeedTabNavigatorProp = CompositeNavigationProp<
  MainTabNavigatorProp,
  MaterialTopTabNavigationProp<FeedTabNavigatorParamList>
>;

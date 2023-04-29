import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackNavigatorParamList = {
  MainTabs: NavigatorScreenParams<MainTabNavigatorParamList>;
  Login: NavigatorScreenParams<LoginStackNavigatorParamList>;
  UserSuggestionList: { onUserPress: (username: string) => void };
  TwitterSuggestionList: { onUserPress: (username: string) => void };
  ProfileQRCode: { username: string };
};

export type LoggedInStackNavigatorParamList = {
  Profile: { username: string };
  NftDetail: {
    tokenId: string;
    collectionId: string;
  };

  // The main four tabs
  Account: undefined;
  Home: NavigatorScreenParams<FeedTabNavigatorParamList>;
  Notifications: undefined;
  Search: undefined;
  // End the main four tabs
};

export type FeedTabNavigatorParamList = {
  Trending: undefined;
  Latest: undefined;
  Explore: undefined;
};

export type MainTabNavigatorParamList = {
  AccountTab: NavigatorScreenParams<LoggedInStackNavigatorParamList>;
  HomeTab: NavigatorScreenParams<LoggedInStackNavigatorParamList>;
  NotificationsTab: NavigatorScreenParams<LoggedInStackNavigatorParamList>;
  SearchTab: NavigatorScreenParams<LoggedInStackNavigatorParamList>;
};

export type LoginStackNavigatorParamList = {
  Landing: undefined;
  EnterEmail: undefined;
  QRCode: undefined;
  WaitingForConfirmation: { email: string };
};

export type RootStackNavigatorProp = NativeStackNavigationProp<RootStackNavigatorParamList>;

export type LoggedInStackNavigatorProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackNavigatorParamList, 'MainTabs'>,
  NativeStackNavigationProp<LoggedInStackNavigatorParamList>
>;

export type LoginStackNavigatorProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackNavigatorParamList, 'Login'>,
  NativeStackNavigationProp<LoginStackNavigatorParamList>
>;

export type MainTabNavigatorProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackNavigatorParamList, 'MainTabs'>,
  MaterialTopTabNavigationProp<MainTabNavigatorParamList>
>;

export type FeedTabNavigatorProp = CompositeNavigationProp<
  MainTabNavigatorProp,
  MaterialTopTabNavigationProp<FeedTabNavigatorParamList>
>;

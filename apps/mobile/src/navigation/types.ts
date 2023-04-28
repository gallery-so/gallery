import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackNavigatorParamList = {
  MainTabs: NavigatorScreenParams<MainTabNavigatorParamList>;
  Login: NavigatorScreenParams<LoginStackNavigatorParamList>;
  Profile: { username: string };
  ProfileQRCode: { username: string };
  NftDetail: {
    tokenId: string;
    collectionId: string;
  };
  UserSuggestionList: undefined;
  TwitterSuggestionList: undefined;
};

export type FeedTabNavigatorParamList = {
  Trending: undefined;
  Latest: undefined;
  Explore: undefined;
};

export type MainTabNavigatorParamList = {
  Account: undefined;
  Home: NavigatorScreenParams<FeedTabNavigatorParamList>;
  Notifications: undefined;
  Search: undefined;
};

export type LoginStackNavigatorParamList = {
  Landing: undefined;
  EnterEmail: undefined;
  QRCode: undefined;
  WaitingForConfirmation: { email: string };
};

export type RootStackNavigatorProp = NativeStackNavigationProp<RootStackNavigatorParamList>;

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

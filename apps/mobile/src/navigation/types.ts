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
};

export type FeedTabNavigatorParamList = {
  Trending: undefined;
  Latest: undefined;
  Featured: undefined;
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

export type ProfileTabNavigatorParamList = {
  Featured: undefined;
  Galleries: undefined;
  Followers: undefined;
  Activity: undefined;
};

export type FollowersTabNavigatorParamList = {
  FollowersList: undefined;
  FollowingList: undefined;
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

export type ProfileTabNavigatorProp = CompositeNavigationProp<
  RootStackNavigatorProp,
  MaterialTopTabNavigationProp<ProfileTabNavigatorParamList>
>;

export type FollowersTabNavigatorProp = CompositeNavigationProp<
  ProfileTabNavigatorProp,
  MaterialTopTabNavigationProp<ProfileTabNavigatorParamList>
>;

export type FeedTabNavigatorProp = CompositeNavigationProp<
  MainTabNavigatorProp,
  MaterialTopTabNavigationProp<FeedTabNavigatorParamList>
>;

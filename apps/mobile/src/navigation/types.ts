import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackNavigatorParamList = {
  MainTabs: NavigatorScreenParams<MainTabNavigatorParamList>;
  Login: NavigatorScreenParams<LoginStackNavigatorParamList>;
  UserSuggestionList: { onUserPress: (username: string) => void };
  TwitterSuggestionList: { onUserPress: (username: string) => void };
  ProfileQRCode: { username: string };
  DesignSystemButtons: undefined;
};

export type MainTabStackNavigatorParamList = {
  Profile: { username: string; hideBackButton?: boolean };
  NftDetail: {
    tokenId: string;
    collectionId: string | null;
    cachedPreviewAssetUrl: string | null;
  };
  Gallery: { galleryId: string };
  Collection: { collectionId: string };
  FeedEvent: { eventId: string };
  Community: { contractAddress: string; chain: string };

  // The main five tabs
  Account: undefined;
  Home: NavigatorScreenParams<FeedTabNavigatorParamList>;

  Notifications:
    | {
        // We pass a fetch key when the user presses a notification so the content is guaranteed to be fresh.
        fetchKey?: string;
      }
    | undefined;

  Search: undefined;
  Settings: undefined;
  // End the main four tabs
};

export type FeedTabNavigatorParamList = {
  Trending: undefined;
  Latest: undefined;
  Explore: undefined;
};

export type MainTabNavigatorParamList = {
  AccountTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
  HomeTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
  NotificationsTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
  SearchTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
  SettingsTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
};

export type LoginStackNavigatorParamList = {
  Landing: undefined;
  EnterEmail: undefined;
  QRCode: { onError: (message: string) => void };
  WaitingForConfirmation: { email: string };
  NotificationUpsell: undefined;
};

export type RootStackNavigatorProp = NativeStackNavigationProp<RootStackNavigatorParamList>;

export type MainTabStackNavigatorProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackNavigatorParamList, 'MainTabs'>,
  NativeStackNavigationProp<MainTabStackNavigatorParamList>
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

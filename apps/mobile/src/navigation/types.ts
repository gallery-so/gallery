import { LoginWithEmailHookResult } from '@privy-io/expo';
import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { OnReplyPressParams } from '~/components/Feed/CommentsBottomSheet/CommentsBottomSheetLine';
import { AuthPayloadVariables } from '~/shared/hooks/useAuthPayloadQuery';
import { CommunitySubtype } from '~/shared/utils/extractRelevantMetadataFromToken';

export type RootStackNavigatorParamList = {
  MainTabs: NavigatorScreenParams<MainTabNavigatorParamList>;
  Login: NavigatorScreenParams<LoginStackNavigatorParamList>;
  UserSuggestionList: { onUserPress: (username: string) => void };
  TwitterSuggestionList: { onUserPress: (username: string) => void };
  ProfileQRCode: { username: string };
  DesignSystemButtons: undefined;
  Debugger: undefined;
  PostNftSelector: {
    page: ScreenWithNftSelector;
  };
  NftSelectorContractScreen: { contractAddress: string; page: ScreenWithNftSelector };
  PostComposer: {
    tokenId: string;
    redirectTo?: PostRedirect;
  };
  GalleryEditor: {
    galleryId: string;
    stagedTokens: string[];
  };
  NftSelectorGalleryEditor: {
    galleryId: string;
  };
  NftSelectorContractGalleryEditor: {
    galleryId: string;
    contractAddress: string;
    ownerFilter?: 'Collected' | 'Created';
  };
};

export type ScreenWithNftSelector = 'ProfilePicture' | 'Post' | 'Community' | 'Onboarding';
export type MainTabStackNavigatorParamList = {
  Profile: { username: string; hideBackButton?: boolean; navigateToTab?: string };
  NftDetail: {
    tokenId: string;
    collectionId: string | null;
    cachedPreviewAssetUrl: string | null;
  };
  UniversalNftDetail: {
    tokenId: string;
    cachedPreviewAssetUrl: string | null;
  };
  Gallery: { galleryId: string };
  Collection: { collectionId: string };
  FeedEvent: { eventId: string };
  Community: {
    contractAddress: string;
    chain: string;
    postId?: string;
    creatorName?: string;
    subtype: CommunitySubtype;
    projectId?: string;
  };

  NftSelector: {
    fullScreen?: boolean;
    page: ScreenWithNftSelector;
  };
  NftSelectorContractScreen: {
    contractAddress: string;
    fullScreen?: boolean;
    ownerFilter?: 'Collected' | 'Created';
    page: ScreenWithNftSelector;
  };
  CommunityNftSelectorScreen: {
    contractAddress: string;
    fullScreen?: boolean;
    ownerFilter?: 'Collected' | 'Created';
    page: ScreenWithNftSelector;
  };
  SettingsProfile: undefined;
  Post: { postId: string; commentId?: string; replyToComment?: OnReplyPressParams };
  NotificationSettingsScreen: undefined;

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
  'For You': {
    // check if new registered user, we show a welcome message
    isNewUser?: boolean;
    showMarfaCheckIn?: boolean;
    postId?: string;
    creatorName?: string;
  };
  Latest: {
    postId?: string;
    creatorName?: string;
  };
  Explore: undefined;
};

export type MainTabNavigatorParamList = {
  AccountTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
  HomeTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
  NotificationsTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
  SearchTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
  SettingsTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
  PostTab: NavigatorScreenParams<MainTabStackNavigatorParamList>;
};

export type AuthMethodTitle = 'Privy' | 'Wallet' | 'Farcaster';

export type LoginStackNavigatorParamList = {
  Landing: undefined;
  QRCode: { onError: (message: string) => void };
  WaitingForConfirmation: { email: string };
  NotificationUpsell: {
    isNewUser: boolean;
  };

  OnboardingVideo: undefined;
  OnboardingEmail: {
    authMethod: AuthMethodTitle;
    authMechanism?: AuthPayloadVariables;
  };

  Onboarding2FA: {
    authMethod: AuthMethodTitle;
    email: string;
    authMechanism: AuthPayloadVariables;
    loginWithCode: LoginWithEmailHookResult['loginWithCode'];
  };

  OnboardingUsername: {
    authMechanism: AuthPayloadVariables;
    email?: string;
    authMethod: AuthMethodTitle;
  };

  OnboardingProfileBio: undefined;

  OnboardingRecommendedUsers: undefined;

  OnboardingNftSelector: {
    page: ScreenWithNftSelector;
    fullScreen?: boolean;
  };

  OnboardingNftSelectorContract: {
    contractAddress: string;
    fullScreen?: boolean;
    ownerFilter?: 'Collected' | 'Created';
    page: ScreenWithNftSelector;
  };

  OnboardingPersona: undefined;
};

export type PostRedirect = 'Latest' | 'Community';
export type PostStackNavigatorParamList = {
  NftSelector: {
    page: ScreenWithNftSelector;
  };
  PostComposer: {
    tokenId: string;
    redirectTo: PostRedirect;
  };
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

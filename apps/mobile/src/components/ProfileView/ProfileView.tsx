import { useNavigation } from '@react-navigation/native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ViewProps } from 'react-native';
import { CollapsibleRef, Tabs } from 'react-native-collapsible-tab-view';
import FastImage from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { TopMemberBadgeIcon } from 'src/icons/TopMemberBadgeIcon';

import { ButtonChip } from '~/components/ButtonChip';
import { GalleryProfileNavBar } from '~/components/ProfileView/GalleryProfileNavBar';
import { ProfileViewHeader } from '~/components/ProfileView/ProfileViewHeader';
import { ProfileViewActivityTab } from '~/components/ProfileView/Tabs/ProfileViewActivityTab';
import { ProfileViewFeaturedTab } from '~/components/ProfileView/Tabs/ProfileViewFeaturedTab';
import { ProfileViewFollowersTab } from '~/components/ProfileView/Tabs/ProfileViewFollowersTab';
import { ProfileViewGalleriesTab } from '~/components/ProfileView/Tabs/ProfileViewGalleriesTab';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { ProfileViewConnectedProfilePictureFragment$key } from '~/generated/ProfileViewConnectedProfilePictureFragment.graphql';
import { ProfileViewConnectedQueryFragment$key } from '~/generated/ProfileViewConnectedQueryFragment.graphql';
import { ProfileViewQueryFragment$key } from '~/generated/ProfileViewQueryFragment.graphql';
import { ProfileViewUsernameFragment$key } from '~/generated/ProfileViewUsernameFragment.graphql';
import {
  MainTabStackNavigatorParamList,
  MainTabStackNavigatorProp,
  RootStackNavigatorProp,
} from '~/navigation/types';
import GalleryViewEmitter from '~/shared/components/GalleryViewEmitter';
import { BADGE_ENABLED_COMMUNITY_ADDRESSES } from '~/shared/utils/communities';

import { FollowButton } from '../FollowButton';
import { GalleryBottomSheetModalType } from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTabsContainer } from '../GalleryTabs/GalleryTabsContainer';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import PfpBottomSheet from '../PfpPicker/PfpBottomSheet';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import BadgeProfileBottomSheet from './BadgeProfileBottomSheet';
import { ProfileViewBookmarksTab } from './Tabs/ProfileViewBookmarksTab';

type ProfileViewProps = {
  shouldShowBackButton: boolean;
  queryRef: ProfileViewQueryFragment$key;
};

export function ProfileView({ queryRef, shouldShowBackButton }: ProfileViewProps) {
  const query = useFragment(
    graphql`
      fragment ProfileViewQueryFragment on Query {
        ...ProfileViewConnectedQueryFragment
        ...ProfileViewFollowersTabQueryFragment
        ...GalleryViewEmitterWithSuspenseFragment
        ...ProfileViewHeaderFragment
        ...ProfileViewGalleriesTabFragment
        ...ProfileViewFeaturedTabFragment
        ...ProfileViewActivityTabFragment
        ...ProfileViewUsernameFragment
        ...ProfileViewConnectedProfilePictureFragment
        ...FollowButtonQueryFragment
        ...ProfileViewBookmarksTabFragment
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
        userByUsername(username: $username) {
          ... on GalleryUser {
            __typename
            dbid
            ...FollowButtonUserFragment
          }
        }
      }
    `,
    queryRef
  );
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Profile'>>();

  const navigateToTab = route.params?.navigateToTab;
  const [selectedRoute, setSelectedRoute] = useState(navigateToTab ?? 'Featured');

  const Header = useCallback(() => {
    return (
      <ProfileViewHeader
        queryRef={query}
        selectedRoute={selectedRoute}
        onRouteChange={setSelectedRoute}
      />
    );
  }, [query, selectedRoute]);

  const containerRef = useRef<CollapsibleRef>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.jumpToTab(selectedRoute);
    }
  }, [selectedRoute]);

  const navigation = useNavigation<RootStackNavigatorProp>();
  useEffect(() => {
    if (navigateToTab) {
      setSelectedRoute(navigateToTab);
      navigation.setParams({ navigateToTab: null });
    }
  }, [navigateToTab, navigation]);

  const isLoggedInUser = Boolean(
    query.userByUsername &&
      'dbid' in query.userByUsername &&
      query.viewer?.user?.dbid === query.userByUsername?.dbid
  );

  if (query.userByUsername?.__typename !== 'GalleryUser') {
    throw new Error('User not found for profile');
  }

  return (
    <View className="flex-1">
      <GalleryViewEmitter queryRef={query} />

      <View className="flex flex-col px-4 pt-4 pb-1 z-10 bg-white dark:bg-black-900">
        <ConnectedGalleryProfileNavbar
          queryRef={query}
          shouldShowBackButton={shouldShowBackButton}
        />

        <View className="flex flex-row items-center justify-between pt-4">
          <View className="flex flex-row">
            <ConnectedProfilePicture queryRef={query} />
            <ProfileViewUsername queryRef={query} />
          </View>
          {isLoggedInUser ? (
            <EditProfileButton />
          ) : (
            <FollowButton queryRef={query} userRef={query.userByUsername} />
          )}
        </View>
      </View>

      <View className="flex-grow">
        <GalleryTabsContainer
          Header={Header}
          ref={containerRef}
          initialTabName={navigateToTab ?? 'Featured'}
        >
          <Tabs.Tab name="Featured">
            <ProfileViewFeaturedTab queryRef={query} />
          </Tabs.Tab>
          <Tabs.Tab name="Galleries">
            <ProfileViewGalleriesTab queryRef={query} />
          </Tabs.Tab>
          <Tabs.Tab name="Posts">
            <ProfileViewActivityTab queryRef={query} />
          </Tabs.Tab>
          {isLoggedInUser ? (
            <Tabs.Tab name="Bookmarks">
              <ProfileViewBookmarksTab queryRef={query} />
            </Tabs.Tab>
          ) : null}
          <Tabs.Tab name="Followers">
            <ProfileViewFollowersTab queryRef={query} />
          </Tabs.Tab>
        </GalleryTabsContainer>
      </View>
    </View>
  );
}

type ConnectedGalleryProfileNavbarProps = {
  shouldShowBackButton: boolean;
  queryRef: ProfileViewConnectedQueryFragment$key;
};

function ConnectedGalleryProfileNavbar({
  shouldShowBackButton,
  queryRef,
}: ConnectedGalleryProfileNavbarProps) {
  const query = useFragment(
    graphql`
      fragment ProfileViewConnectedQueryFragment on Query {
        ...GalleryProfileNavBarQueryFragment

        userByUsername(username: $username) {
          ... on GalleryUser {
            __typename
            ...GalleryProfileNavBarFragment
          }
        }
      }
    `,
    queryRef
  );

  if (query.userByUsername?.__typename !== 'GalleryUser') {
    return null;
  }

  return (
    <GalleryProfileNavBar
      shouldShowBackButton={shouldShowBackButton}
      queryRef={query}
      userRef={query.userByUsername}
      screen="Profile"
    />
  );
}

type ProfileViewUsernameProps = {
  style?: ViewProps['style'];
  queryRef: ProfileViewUsernameFragment$key;
};

const BADGE_DESCRIPTIONS: Record<string, string> = {
  'Top Member':
    'Awarded for being one of the most active contributors on Gallery in the past week.',
  'Community pillar badge': 'Awarded for high-quality engagement',
  'Gallery Membership Cards':
    'This exclusive badge on your profile signifies that you hold one of the coveted Gallery membership cards. This gives you early access to beta features and access to Members Only **Discord channel**.',
};

export function ProfileViewUsername({ queryRef, style }: ProfileViewUsernameProps) {
  const query = useFragment(
    graphql`
      fragment ProfileViewUsernameFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            username
            badges {
              name
              imageURL
              contract {
                __typename
                contractAddress {
                  address
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const filteredBadges = useMemo(() => {
    const badges = query.userByUsername?.badges ?? [];
    return badges.filter((badge) => {
      if (badge?.contract) {
        return BADGE_ENABLED_COMMUNITY_ADDRESSES.has(
          badge?.contract?.contractAddress?.address ?? ''
        );
      }

      return Boolean(badge?.imageURL);
    });
  }, [query.userByUsername?.badges]);

  const [selectedBadge, setSelectedBadge] = useState<{
    name: string;
    description: string;
  } | null>(null);

  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  const handlePress = useCallback(
    (badgeName: string) => {
      setSelectedBadge({
        name: badgeName,
        description: BADGE_DESCRIPTIONS[badgeName] ?? '',
      });

      showBottomSheetModal({
        content: (
          <BadgeProfileBottomSheet
            onClose={hideBottomSheetModal}
            title={selectedBadge?.name ?? ''}
            description={selectedBadge?.description ?? ''}
          />
        ),
      });
    },
    [hideBottomSheetModal, selectedBadge?.description, selectedBadge?.name, showBottomSheetModal]
  );

  return (
    <View style={style} className="flex-row gap-1">
      <Typography
        className="bg-white dark:bg-black-900 text-2xl tracking-tighter"
        font={{ family: 'GTAlpina', weight: 'StandardLight' }}
      >
        {query.userByUsername?.username}
      </Typography>

      <View className="flex flex-row items-center space-x-1">
        {filteredBadges.map((badge, index) => (
          <GalleryTouchableOpacity
            onPress={() => handlePress(badge?.name ?? '')}
            eventElementId={null}
            eventName={null}
            key={index}
            eventContext={null}
          >
            {badge?.name === 'Top Member' ? (
              <TopMemberBadgeIcon />
            ) : (
              <FastImage
                className="h-5 w-5 rounded-full"
                source={{
                  uri: badge?.imageURL ?? '',
                }}
              />
            )}
          </GalleryTouchableOpacity>
        ))}
      </View>
    </View>
  );
}

type ConnectedProfilePictureProps = {
  queryRef: ProfileViewConnectedProfilePictureFragment$key;
};

function ConnectedProfilePicture({ queryRef }: ConnectedProfilePictureProps) {
  const query = useFragment(
    graphql`
      fragment ProfileViewConnectedProfilePictureFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
              primaryWallet {
                __typename
              }
            }
          }
        }

        userByUsername(username: $username) {
          ... on GalleryUser {
            __typename

            dbid

            ...ProfilePictureFragment
          }
        }

        ...PfpBottomSheetFragment
      }
    `,
    queryRef
  );

  const isLoggedInUser = Boolean(
    query.userByUsername &&
      'dbid' in query.userByUsername &&
      query.viewer?.user?.dbid === query.userByUsername?.dbid
  );

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const { openManageWallet } = useManageWalletActions();
  const userHasWallet = query.viewer?.user?.primaryWallet?.__typename === 'Wallet';
  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();
  const handlePress = useCallback(() => {
    if (!isLoggedInUser) {
      return;
    }

    if (!userHasWallet) {
      openManageWallet({
        onSuccess: () => {
          showBottomSheetModal({
            content: <PfpBottomSheet onClose={hideBottomSheetModal} queryRef={query} />,
          });
        },
      });
      return;
    }

    showBottomSheetModal({
      content: <PfpBottomSheet onClose={hideBottomSheetModal} queryRef={query} />,
    });
  }, [
    hideBottomSheetModal,
    isLoggedInUser,
    openManageWallet,
    query,
    showBottomSheetModal,
    userHasWallet,
  ]);

  return (
    <View className="mr-2">
      <ProfilePicture
        size="md"
        onPress={handlePress}
        isEditable={isLoggedInUser}
        userRef={query.userByUsername?.__typename === 'GalleryUser' ? query.userByUsername : null}
      />
    </View>
  );
}

function EditProfileButton() {
  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    navigation.navigate('SettingsProfile');
  }, [navigation]);

  return (
    <ButtonChip variant="secondary" onPress={handlePress}>
      Edit Profile
    </ButtonChip>
  );
}

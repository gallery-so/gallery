import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, ViewProps } from 'react-native';
import { CollapsibleRef, Tabs } from 'react-native-collapsible-tab-view';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ButtonChip } from '~/components/ButtonChip';
import { GalleryProfileNavBar } from '~/components/ProfileView/GalleryProfileNavBar';
import { ProfileViewHeader } from '~/components/ProfileView/ProfileViewHeader';
import { ProfileViewActivityTab } from '~/components/ProfileView/Tabs/ProfileViewActivityTab';
import { ProfileViewFeaturedTab } from '~/components/ProfileView/Tabs/ProfileViewFeaturedTab';
import { ProfileViewFollowersTab } from '~/components/ProfileView/Tabs/ProfileViewFollowersTab';
import { ProfileViewGalleriesTab } from '~/components/ProfileView/Tabs/ProfileViewGalleriesTab';
import { Typography } from '~/components/Typography';
import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { ProfileViewConnectedProfilePictureFragment$key } from '~/generated/ProfileViewConnectedProfilePictureFragment.graphql';
import { ProfileViewConnectedQueryFragment$key } from '~/generated/ProfileViewConnectedQueryFragment.graphql';
import { ProfileViewEditProfileButtonFragment$key } from '~/generated/ProfileViewEditProfileButtonFragment.graphql';
import { ProfileViewQueryFragment$key } from '~/generated/ProfileViewQueryFragment.graphql';
import { ProfileViewUsernameFragment$key } from '~/generated/ProfileViewUsernameFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import GalleryViewEmitter from '~/shared/components/GalleryViewEmitter';

import { GalleryBottomSheetModalType } from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTabsContainer } from '../GalleryTabs/GalleryTabsContainer';
import { PfpBottomSheet } from '../PfpPicker/PfpBottomSheet';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

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
        ...ProfileViewGalleriesTabFragment
        ...ProfileViewFeaturedTabFragment
        ...ProfileViewActivityTabFragment
        ...ProfileViewUsernameFragment
        ...ProfileViewConnectedProfilePictureFragment
        ...ProfileViewEditProfileButtonFragment
        ...ProfileViewHeaderFragment
      }
    `,
    queryRef
  );

  const [selectedRoute, setSelectedRoute] = useState('Featured');

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
          <EditProfileButton queryRef={query} />
        </View>
      </View>

      <View className="flex-grow">
        <GalleryTabsContainer Header={Header} ref={containerRef}>
          <Tabs.Tab name="Featured">
            <ProfileViewFeaturedTab queryRef={query} />
          </Tabs.Tab>
          <Tabs.Tab name="Galleries">
            <ProfileViewGalleriesTab queryRef={query} />
          </Tabs.Tab>
          <Tabs.Tab name="Posts">
            <ProfileViewActivityTab queryRef={query} />
          </Tabs.Tab>
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

export function ProfileViewUsername({ queryRef, style }: ProfileViewUsernameProps) {
  const query = useFragment(
    graphql`
      fragment ProfileViewUsernameFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            username
          }
        }
      }
    `,
    queryRef
  );

  return (
    <View style={style}>
      <Typography
        className="bg-white dark:bg-black-900 text-2xl tracking-tighter"
        font={{ family: 'GTAlpina', weight: 'StandardLight' }}
      >
        {query.userByUsername?.username}
      </Typography>
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

  const handlePress = useCallback(() => {
    if (!isLoggedInUser) {
      return;
    }

    if (!userHasWallet) {
      openManageWallet({
        onSuccess: () => {
          bottomSheetRef.current?.present();
        },
      });
      return;
    }

    bottomSheetRef.current?.present();
  }, [isLoggedInUser, openManageWallet, userHasWallet]);

  return (
    <View className="mr-2">
      <ProfilePicture
        size="md"
        onPress={handlePress}
        isEditable={isLoggedInUser}
        userRef={query.userByUsername?.__typename === 'GalleryUser' ? query.userByUsername : null}
      />

      <PfpBottomSheet ref={bottomSheetRef} queryRef={query} />
    </View>
  );
}

type EditProfileButtonProps = {
  queryRef: ProfileViewEditProfileButtonFragment$key;
};

function EditProfileButton({ queryRef }: EditProfileButtonProps) {
  const query = useFragment(
    graphql`
      fragment ProfileViewEditProfileButtonFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            dbid
          }
        }

        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const isLoggedInUser = Boolean(query.viewer?.user?.dbid === query.userByUsername?.dbid);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    navigation.navigate('SettingsProfile');
  }, [navigation]);

  if (!isLoggedInUser) {
    return null;
  }

  return (
    <ButtonChip variant="secondary" onPress={handlePress}>
      Edit Profile
    </ButtonChip>
  );
}

import { useColorScheme } from 'nativewind';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { View, ViewProps } from 'react-native';
import { CollapsibleRef, Tabs } from 'react-native-collapsible-tab-view';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryProfileNavBar } from '~/components/ProfileView/GalleryProfileNavBar';
import { ProfileViewHeader } from '~/components/ProfileView/ProfileViewHeader';
import { ProfileViewActivityTab } from '~/components/ProfileView/Tabs/ProfileViewActivityTab';
import { ProfileViewFeaturedTab } from '~/components/ProfileView/Tabs/ProfileViewFeaturedTab';
import { ProfileViewFollowersTab } from '~/components/ProfileView/Tabs/ProfileViewFollowersTab';
import { ProfileViewGalleriesTab } from '~/components/ProfileView/Tabs/ProfileViewGalleriesTab';
import { Typography } from '~/components/Typography';
import { ProfileViewConnectedProfilePictureFragment$key } from '~/generated/ProfileViewConnectedProfilePictureFragment.graphql';
import { ProfileViewConnectedQueryFragment$key } from '~/generated/ProfileViewConnectedQueryFragment.graphql';
import { ProfileViewQueryFragment$key } from '~/generated/ProfileViewQueryFragment.graphql';
import { ProfileViewUsernameFragment$key } from '~/generated/ProfileViewUsernameFragment.graphql';
import GalleryViewEmitter from '~/shared/components/GalleryViewEmitter';
import colors from '~/shared/theme/colors';

import { GalleryBottomSheetModalType } from '../GalleryBottomSheet/GalleryBottomSheetModal';
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
        ...ProfileViewHeaderFragment
        ...ProfileViewGalleriesTabFragment
        ...ProfileViewFeaturedTabFragment
        ...ProfileViewActivityTabFragment
        ...ProfileViewUsernameFragment
        ...ProfileViewConnectedProfilePictureFragment
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

  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1">
      <GalleryViewEmitter queryRef={query} />

      <View className="flex flex-col px-4 pb-1 z-10 bg-white dark:bg-black-900">
        <ConnectedGalleryProfileNavbar
          queryRef={query}
          shouldShowBackButton={shouldShowBackButton}
        />
        <View className="flex flex-row space-x-2 pt-4">
          <ConnectedProfilePicture queryRef={query} />

          <ProfileViewUsername queryRef={query} />
        </View>
      </View>

      <View className="flex-grow">
        <Suspense fallback={null}>
          <Tabs.Container
            ref={containerRef}
            pagerProps={{ scrollEnabled: false }}
            containerStyle={{
              backgroundColor: colorScheme === 'light' ? colors.white : colors.black['900'],
            }}
            headerContainerStyle={{
              margin: 0,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomColor: 'transparent',
              backgroundColor: colorScheme === 'light' ? colors.white : colors.black['900'],
            }}
            renderTabBar={Empty}
            renderHeader={Header}
          >
            <Tabs.Tab name="Featured">
              <ProfileViewFeaturedTab queryRef={query} />
            </Tabs.Tab>

            <Tabs.Tab name="Galleries">
              <ProfileViewGalleriesTab queryRef={query} />
            </Tabs.Tab>

            <Tabs.Tab name="Followers">
              <ProfileViewFollowersTab queryRef={query} />
            </Tabs.Tab>

            <Tabs.Tab name="Activity">
              <ProfileViewActivityTab queryRef={query} />
            </Tabs.Tab>
          </Tabs.Container>
        </Suspense>
      </View>
    </View>
  );
}

function Empty() {
  return null;
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
  const handlePress = useCallback(() => {
    if (!isLoggedInUser) {
      return;
    }

    bottomSheetRef.current?.present();
  }, [isLoggedInUser]);

  return (
    <>
      <ProfilePicture
        size="md"
        onPress={handlePress}
        isEditable={isLoggedInUser}
        userRef={query.userByUsername?.__typename === 'GalleryUser' ? query.userByUsername : null}
      />

      <PfpBottomSheet ref={bottomSheetRef} queryRef={query} />
    </>
  );
}

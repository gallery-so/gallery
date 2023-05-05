import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { Share, useColorScheme, View } from 'react-native';
import { CollapsibleRef, Tabs } from 'react-native-collapsible-tab-view';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowButton } from '~/components/FollowButton';
import { IconContainer } from '~/components/IconContainer';
import { GalleryProfileNavBar } from '~/components/ProfileView/GalleryProfileNavBar';
import { ProfileViewHeader } from '~/components/ProfileView/ProfileViewHeader';
import { ProfileViewActivityTab } from '~/components/ProfileView/Tabs/ProfileViewActivityTab';
import { ProfileViewFeaturedTab } from '~/components/ProfileView/Tabs/ProfileViewFeaturedTab';
import { ProfileViewFollowersTab } from '~/components/ProfileView/Tabs/ProfileViewFollowersTab';
import { ProfileViewGalleriesTab } from '~/components/ProfileView/Tabs/ProfileViewGalleriesTab';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { GalleryTokenDimensionCacheProvider } from '~/contexts/GalleryTokenDimensionCacheContext';
import { ProfileViewFragment$key } from '~/generated/ProfileViewFragment.graphql';
import { ProfileViewQueryFragment$key } from '~/generated/ProfileViewQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';
import colors from '~/shared/theme/colors';

import { BackIcon } from '../../icons/BackIcon';
import { QRCodeIcon } from '../../icons/QRCodeIcon';
import { ShareIcon } from '../../icons/ShareIcon';
import { FeedbackButton } from '../FeedbackButton';

type ProfileViewProps = {
  shouldShowBackButton: boolean;
  queryRef: ProfileViewQueryFragment$key;
  userRef: ProfileViewFragment$key;
};

export function ProfileView({ userRef, queryRef, shouldShowBackButton }: ProfileViewProps) {
  const query = useFragment(
    graphql`
      fragment ProfileViewQueryFragment on Query {
        ...GalleryProfileNavBarQueryFragment
        ...useLoggedInUserIdFragment
        ...FollowButtonQueryFragment
        ...ProfileViewFollowersTabQueryFragment
        ...ProfileViewActivityTabQueryFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);

  const user = useFragment(
    graphql`
      fragment ProfileViewFragment on GalleryUser {
        __typename

        id
        username

        ...ProfileViewHeaderFragment
        ...ProfileViewFeaturedTabFragment
        ...ProfileViewGalleriesTabFragment
        ...ProfileViewActivityTabFragment
        ...ProfileViewFollowersTabFragment

        ...GalleryProfileNavBarFragment
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const [selectedRoute, setSelectedRoute] = useState('Featured');

  const Header = useCallback(() => {
    return (
      <ProfileViewHeader
        selectedRoute={selectedRoute}
        onRouteChange={setSelectedRoute}
        userRef={user}
      />
    );
  }, [selectedRoute, user]);

  const containerRef = useRef<CollapsibleRef>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.jumpToTab(selectedRoute);
    }
  }, [selectedRoute]);

  const colorScheme = useColorScheme();
  const { top } = useSafeAreaPadding();

  return (
    <View className="flex-1">
      <View
        className="flex flex-col p-4 pb-1 z-10 bg-white dark:bg-black"
        style={{ paddingTop: top }}
      >
        <GalleryProfileNavBar
          shouldShowBackButton={shouldShowBackButton}
          queryRef={query}
          userRef={user}
        />

        <Typography
          className="bg-white dark:bg-black text-center text-2xl tracking-tighter"
          font={{ family: 'GTAlpina', weight: 'StandardLight' }}
        >
          {user.username}
        </Typography>
      </View>

      <View className="flex-grow">
        <GalleryTokenDimensionCacheProvider>
          <Tabs.Container
            revealHeaderOnScroll
            ref={containerRef}
            pagerProps={{ scrollEnabled: false }}
            containerStyle={{
              backgroundColor: colorScheme === 'light' ? colors.white : colors.black,
            }}
            headerContainerStyle={styles.headerReset}
            renderTabBar={Empty}
            renderHeader={Header}
          >
            <Tabs.Tab name="Featured">
              <ProfileViewFeaturedTab userRef={user} />
            </Tabs.Tab>

            <Tabs.Tab name="Galleries">
              <ProfileViewGalleriesTab userRef={user} />
            </Tabs.Tab>

            <Tabs.Tab name="Followers">
              <ProfileViewFollowersTab userRef={user} queryRef={query} />
            </Tabs.Tab>

            <Tabs.Tab name="Activity">
              <ProfileViewActivityTab userRef={user} />
            </Tabs.Tab>
          </Tabs.Container>
        </GalleryTokenDimensionCacheProvider>
      </View>
    </View>
  );
}

function Empty() {
  return null;
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useColorScheme, View } from 'react-native';
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
import { GalleryTokenDimensionCacheProvider } from '~/contexts/GalleryTokenDimensionCacheContext';
import { ProfileViewFragment$key } from '~/generated/ProfileViewFragment.graphql';
import { ProfileViewQueryFragment$key } from '~/generated/ProfileViewQueryFragment.graphql';
import GalleryViewEmitter from '~/shared/components/GalleryViewEmitter';
import colors from '~/shared/theme/colors';

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
        ...ProfileViewFollowersTabQueryFragment
        ...ProfileViewActivityTabQueryFragment
        ...GalleryViewEmitterWithSuspenseFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment ProfileViewFragment on GalleryUser {
        __typename

        username

        ...ProfileViewHeaderFragment
        ...ProfileViewFeaturedTabFragment
        ...ProfileViewGalleriesTabFragment
        ...ProfileViewActivityTabFragment
        ...ProfileViewFollowersTabFragment

        ...GalleryProfileNavBarFragment
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

  return (
    <View className="flex-1">
      <GalleryViewEmitter queryRef={query} />

      <View className="flex flex-col px-4 pb-1 z-10 bg-white dark:bg-black">
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
            ref={containerRef}
            pagerProps={{ scrollEnabled: false }}
            containerStyle={{
              backgroundColor: colorScheme === 'light' ? colors.white : colors.black,
            }}
            headerContainerStyle={{
              margin: 0,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomColor: 'transparent',
              backgroundColor: colorScheme === 'light' ? colors.white : colors.black,
            }}
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
              <ProfileViewActivityTab queryRef={query} userRef={user} />
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

import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ProfileView } from '~/components/ProfileView/ProfileView';
import { ProfileViewFallback } from '~/components/ProfileView/ProfileViewFallback';
import { SHARED_COMMUNITIES_PER_PAGE } from '~/components/ProfileView/ProfileViewSharedInfo/ProfileViewSharedCommunities';
import { SHARED_FOLLOWERS_PER_PAGE } from '~/components/ProfileView/ProfileViewSharedInfo/ProfileViewSharedFollowers';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { ProfileScreenQuery } from '~/generated/ProfileScreenQuery.graphql';
import { ProfileScreenRefetchableFragment$key } from '~/generated/ProfileScreenRefetchableFragment.graphql';
import { ProfileScreenRefetchableFragmentQuery } from '~/generated/ProfileScreenRefetchableFragmentQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

import { useRefreshHandle } from '../../hooks/useRefreshHandle';

function ProfileScreenInner() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Profile'>>();

  const wrapperQuery = useLazyLoadQuery<ProfileScreenQuery>(
    graphql`
      query ProfileScreenQuery(
        $username: String!
        $feedLast: Int!
        $feedBefore: String
        $sharedCommunitiesFirst: Int
        $sharedCommunitiesAfter: String
        $sharedFollowersFirst: Int
        $sharedFollowersAfter: String
      ) {
        ...ProfileScreenRefetchableFragment
      }
    `,
    {
      username: route.params.username,
      feedLast: 24,
      sharedCommunitiesFirst: SHARED_COMMUNITIES_PER_PAGE,
      sharedFollowersFirst: SHARED_FOLLOWERS_PER_PAGE,
    },
    { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
  );

  const [query, refetch] = useRefetchableFragment<
    ProfileScreenRefetchableFragmentQuery,
    ProfileScreenRefetchableFragment$key
  >(
    graphql`
      fragment ProfileScreenRefetchableFragment on Query
      @refetchable(queryName: "ProfileScreenRefetchableFragmentQuery") {
        ...ProfileViewQueryFragment
      }
    `,
    wrapperQuery
  );

  const { top } = useSafeAreaPadding();
  const { isRefreshing, handleRefresh } = useRefreshHandle(refetch);

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <ProfileView queryRef={query} shouldShowBackButton={!route.params.hideBackButton} />
      </ScrollView>
    </View>
  );
}

export function ProfileScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Profile'>>();

  return (
    <View className="flex-1 bg-white dark:bg-black-900">
      <Suspense
        fallback={<ProfileViewFallback shouldShowBackButton={!route.params.hideBackButton} />}
      >
        <ProfileScreenInner />
      </Suspense>
    </View>
  );
}

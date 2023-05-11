import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense, useMemo } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesList';
import { ProfileView } from '~/components/ProfileView/ProfileView';
import { ProfileViewFallback } from '~/components/ProfileView/ProfileViewFallback';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
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
        $interactionsFirst: Int!
        $interactionsAfter: String
      ) {
        ...ProfileScreenRefetchableFragment
      }
    `,
    {
      username: route.params.username,
      feedLast: 24,
      interactionsFirst: NOTES_PER_PAGE,
    },
    { fetchPolicy: 'network-only' }
  );

  const [query, refetch] = useRefetchableFragment<
    ProfileScreenRefetchableFragmentQuery,
    ProfileScreenRefetchableFragment$key
  >(
    graphql`
      fragment ProfileScreenRefetchableFragment on Query
      @refetchable(queryName: "ProfileScreenRefetchableFragmentQuery") {
        userByUsername(username: $username) {
          ... on GalleryUser {
            ...ProfileViewFragment
          }

          ... on ErrUserNotFound {
            __typename
          }

          ... on Error {
            __typename
          }
        }

        ...ProfileViewQueryFragment
      }
    `,
    wrapperQuery
  );

  const { top } = useSafeAreaPadding();
  const { isRefreshing, handleRefresh } = useRefreshHandle(refetch);

  const inner = useMemo(() => {
    if (query.userByUsername?.__typename === 'GalleryUser') {
      return (
        <View style={{ flex: 1, paddingTop: top }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flex: 1 }}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          >
            <ProfileView
              queryRef={query}
              userRef={query.userByUsername}
              shouldShowBackButton={!route.params.hideBackButton}
            />
          </ScrollView>
        </View>
      );
    } else {
      return <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>Not found</Typography>;
    }
  }, [handleRefresh, isRefreshing, query, route.params.hideBackButton, top]);

  return inner;
}

export function ProfileScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Suspense fallback={<ProfileViewFallback />}>
        <ProfileScreenInner />
      </Suspense>
    </View>
  );
}

import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { FeedList } from '~/components/Feed/FeedList';
import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';
import { FeedEventRefetchableFragmentQuery } from '~/generated/FeedEventRefetchableFragmentQuery.graphql';
import { FeedEventScreenFragment$key } from '~/generated/FeedEventScreenFragment.graphql';
import { FeedEventScreenQuery } from '~/generated/FeedEventScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

import { useRefreshHandle } from '../hooks/useRefreshHandle';

function FeedEventScreenInner() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'FeedEvent'>>();
  const wrapperQuery = useLazyLoadQuery<FeedEventScreenQuery>(
    graphql`
      query FeedEventScreenQuery(
        $feedEventId: DBID!
        $interactionsFirst: Int!
        $interactionsAfter: String
      ) {
        ...FeedEventScreenFragment
      }
    `,
    { interactionsFirst: 10, feedEventId: route.params.eventId }
  );

  const [query, refetch] = useRefetchableFragment<
    FeedEventRefetchableFragmentQuery,
    FeedEventScreenFragment$key
  >(
    graphql`
      fragment FeedEventScreenFragment on Query
      @refetchable(queryName: "FeedEventRefetchableFragmentQuery") {
        feedEventById(id: $feedEventId) {
          ... on FeedEvent {
            __typename
            ...FeedListFragment
          }
        }

        ...FeedListQueryFragment
      }
    `,
    wrapperQuery
  );

  const { isRefreshing, handleRefresh } = useRefreshHandle(refetch);

  if (query.feedEventById?.__typename === 'FeedEvent') {
    return (
      <FeedList
        queryRef={query}
        isLoadingMore={false}
        onLoadMore={() => {}}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        feedEventRefs={[query.feedEventById]}
      />
    );
  }

  return null;
}

export function FeedEventScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <SafeAreaViewWithPadding className="flex-1">
        <View className="px-3 pb-6">
          <BackButton />
        </View>

        <Suspense fallback={null}>
          <FeedEventScreenInner />
        </Suspense>
      </SafeAreaViewWithPadding>
    </View>
  );
}

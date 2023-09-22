import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { useRefreshHandle } from 'src/hooks/useRefreshHandle';

import { BackButton } from '~/components/BackButton';
import { FeedList } from '~/components/Feed/FeedList';
import { PostRefetchableFragmentQuery } from '~/generated/PostRefetchableFragmentQuery.graphql';
import { PostScreenFragment$key } from '~/generated/PostScreenFragment.graphql';
import { PostScreenQuery } from '~/generated/PostScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

function PostScreenInner() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Post'>>();
  const wrapperQuery = useLazyLoadQuery<PostScreenQuery>(
    graphql`
      query PostScreenQuery($postId: DBID!) {
        ...PostScreenFragment
      }
    `,
    { postId: route.params.postId }
  );

  const [query, refetch] = useRefetchableFragment<
    PostRefetchableFragmentQuery,
    PostScreenFragment$key
  >(
    graphql`
      fragment PostScreenFragment on Query @refetchable(queryName: "PostRefetchableFragmentQuery") {
        postById(id: $postId) {
          ... on Post {
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

  if (query.postById?.__typename === 'Post') {
    return (
      <FeedList
        queryRef={query}
        isLoadingMore={false}
        onLoadMore={() => {}}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        feedEventRefs={[query.postById]}
      />
    );
  }

  return null;
}

export function PostScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-black-900">
      <View className="px-3 pb-6">
        <BackButton />
      </View>

      <Suspense fallback={null}>
        <PostScreenInner />
      </Suspense>
    </View>
  );
}

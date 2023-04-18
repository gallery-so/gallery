import { useRoute } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedList } from '~/components/Feed/FeedList';
import { ActivityScreenFeedListFragment$key } from '~/generated/ActivityScreenFeedListFragment.graphql';
import { ActivityScreenFeedListFragmentPaginationQuery } from '~/generated/ActivityScreenFeedListFragmentPaginationQuery.graphql';
import { ActivityScreenQuery } from '~/generated/ActivityScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export function ActivityScreen() {
  const route = useRoute();

  let username: string | null = null;
  if (route.params && 'username' in route.params) {
    username = route.params.username as string;
  }

  const query = useLazyLoadQuery<ActivityScreenQuery>(
    graphql`
      query ActivityScreenQuery(
        $username: String!
        $hasUsername: Boolean!
        $before: String
        $last: Int!
      ) {
        userByUsername(username: $username) @include(if: $hasUsername) {
          ... on GalleryUser {
            ...ActivityScreenFeedListFragment
          }
        }

        viewer @skip(if: $hasUsername) {
          ... on Viewer {
            user {
              ...ActivityScreenFeedListFragment
            }
          }
        }
      }
    `,
    { username: username ?? '', hasUsername: username !== null, last: 24 }
  );

  const user = query.userByUsername ?? query.viewer?.user;

  const {
    data: feedList,
    hasPrevious,
    loadPrevious,
    isLoadingPrevious,
  } = usePaginationFragment<
    ActivityScreenFeedListFragmentPaginationQuery,
    ActivityScreenFeedListFragment$key
  >(
    graphql`
      fragment ActivityScreenFeedListFragment on GalleryUser
      @refetchable(queryName: "ActivityScreenFeedListFragmentPaginationQuery") {
        feed(last: $last, before: $before) @connection(key: "ActivityScreenFeedListFragment_feed") {
          edges {
            node {
              ...FeedListFragment
            }
          }
        }
      }
    `,
    user ?? null
  );

  const handleLoadMore = useCallback(() => {
    if (hasPrevious && !isLoadingPrevious) {
      loadPrevious(24);
    }
  }, [hasPrevious, isLoadingPrevious, loadPrevious]);

  const feedItems = useMemo(() => {
    return removeNullValues(feedList?.feed?.edges?.map((edge) => edge?.node));
  }, [feedList?.feed?.edges]);

  return (
    <View className="flex-1">
      <FeedList
        feedEventRefs={feedItems}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingPrevious}
      />
    </View>
  );
}

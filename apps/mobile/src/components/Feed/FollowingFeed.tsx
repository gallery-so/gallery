import { useCallback, useMemo } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import { useRefreshHandle } from 'src/hooks/useRefreshHandle';

import { FollowingFeedFragment$key } from '~/generated/FollowingFeedFragment.graphql';

import { FEED_PER_PAGE } from './constants';
import { EmptyFeed } from './EmptyFeed';
import { ActiveFeed } from './FeedFilter';
import { FeedList } from './FeedList';

type Props = {
  queryRef: FollowingFeedFragment$key;
  onChangeFeedMode: (feedMode: ActiveFeed) => void;
};

export function FollowingFeed({ queryRef, onChangeFeedMode }: Props) {
  const {
    data: query,
    isLoadingPrevious,
    hasPrevious,
    loadPrevious,
    refetch,
  } = usePaginationFragment(
    graphql`
      fragment FollowingFeedFragment on Query
      @refetchable(queryName: "RefetchableFollowingFeedFragmentQuery") {
        viewer {
          ... on Viewer {
            feed(before: $followingFeedBefore, last: $followingFeedCount)
              @connection(key: "FollowingFeedFragment_feed") {
              edges {
                node {
                  ... on FeedEvent {
                    __typename
                    ...FeedListFragment
                  }
                }
              }
            }
          }
        }

        ...FeedListQueryFragment
      }
    `,
    queryRef
  );
  const { isRefreshing, handleRefresh } = useRefreshHandle(refetch);

  const handleLoadMore = useCallback(() => {
    if (hasPrevious && !isLoadingPrevious) {
      loadPrevious(FEED_PER_PAGE);
    }
  }, [hasPrevious, isLoadingPrevious, loadPrevious]);

  const feedData = useMemo(() => {
    const events = [];

    for (const edge of query.viewer?.feed?.edges ?? []) {
      if (edge?.node?.__typename === 'FeedEvent' && edge.node) {
        events.push(edge.node);
      }
    }

    return events.reverse();
  }, [query.viewer?.feed?.edges]);

  if (!feedData.length) {
    return <EmptyFeed onChangeFeedMode={onChangeFeedMode} />;
  }

  return (
    <FeedList
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      isLoadingMore={isLoadingPrevious}
      onLoadMore={handleLoadMore}
      feedEventRefs={feedData}
      queryRef={query}
      feedFilter={{
        activeFeed: 'Following',
        onFeedChange: onChangeFeedMode,
      }}
    />
  );
}

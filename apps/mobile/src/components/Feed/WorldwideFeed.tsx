import { useCallback, useMemo } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import { useRefreshHandle } from 'src/hooks/useRefreshHandle';

import { WorldwideFeedFragment$key } from '~/generated/WorldwideFeedFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FEED_PER_PAGE } from './constants';
import { ActiveFeed } from './FeedFilter';
import { FeedList } from './FeedList';

type Props = {
  queryRef: WorldwideFeedFragment$key;
  onChangeFeedMode: (feedMode: ActiveFeed) => void;
};

export function WorldwideFeed({ queryRef, onChangeFeedMode }: Props) {
  const {
    data: query,
    isLoadingPrevious,
    hasPrevious,
    loadPrevious,
    refetch,
  } = usePaginationFragment(
    graphql`
      fragment WorldwideFeedFragment on Query
      @refetchable(queryName: "RefetchableWorldwideFeedFragmentQuery") {
        globalFeed(before: $globalFeedBefore, last: $globalFeedCount)
          @connection(key: "WorldwideFeedFragment_globalFeed") {
          edges {
            node {
              __typename
              ...FeedListFragment
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

  const events = useMemo(() => {
    return removeNullValues(query.globalFeed?.edges?.map((it) => it?.node)).reverse();
  }, [query.globalFeed?.edges]);

  return (
    <FeedList
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      isLoadingMore={isLoadingPrevious}
      onLoadMore={handleLoadMore}
      feedEventRefs={events}
      queryRef={query}
      feedFilter={{
        activeFeed: 'Worldwide',
        onFeedChange: onChangeFeedMode,
      }}
    />
  );
}

import { useCallback, useMemo } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';

import { useTrackLoadMoreFeedEvents } from '~/components/Feed/analytics';
import { ITEMS_PER_PAGE } from '~/components/Feed/constants';
import FeedList from '~/components/Feed/FeedList';
import { LatestFeedFragment$key } from '~/generated/LatestFeedFragment.graphql';
import { LatestFeedPaginationQuery } from '~/generated/LatestFeedPaginationQuery.graphql';

type Props = {
  queryRef: LatestFeedFragment$key;
};

export function LatestFeed({ queryRef }: Props) {
  const {
    data: query,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment<LatestFeedPaginationQuery, LatestFeedFragment$key>(
    graphql`
      fragment LatestFeedFragment on Query @refetchable(queryName: "LatestFeedPaginationQuery") {
        globalFeed(last: $latestLast, before: $latestBefore)
          @connection(key: "LatestFeedFragment_globalFeed") {
          edges {
            node {
              ...FeedListEventDataFragment
            }
          }
        }

        ...FeedListFragment
      }
    `,
    queryRef
  );

  const trackLoadMoreFeedEvents = useTrackLoadMoreFeedEvents();
  const loadNextPage = useCallback(() => {
    trackLoadMoreFeedEvents('latest');

    return new Promise<void>((resolve) => {
      loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve() });
    });
  }, [loadPrevious, trackLoadMoreFeedEvents]);

  const feedData = useMemo(() => {
    const feedData = [];

    for (const edge of query.globalFeed?.edges ?? []) {
      if (edge?.node) {
        feedData.push(edge.node);
      }
    }

    return feedData;
  }, [query.globalFeed?.edges]);

  return (
    <FeedList
      loadNextPage={loadNextPage}
      hasNext={hasPrevious}
      queryRef={query}
      feedEventRefs={feedData}
      feedMode="WORLDWIDE"
    />
  );
}

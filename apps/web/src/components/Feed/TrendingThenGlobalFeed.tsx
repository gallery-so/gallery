import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { TrendingThenGlobalFeedFragment$key } from '~/generated/TrendingThenGlobalFeedFragment.graphql';
import { TrendingThenGlobalFeedGlobalFragment$key } from '~/generated/TrendingThenGlobalFeedGlobalFragment.graphql';
import { TrendingThenGlobalFeedGlobalPaginationQuery } from '~/generated/TrendingThenGlobalFeedGlobalPaginationQuery.graphql';
import { TrendingThenGlobalFeedTrendingFragment$key } from '~/generated/TrendingThenGlobalFeedTrendingFragment.graphql';
import { TrendingThenGlobalFeedTrendingPaginationQuery } from '~/generated/TrendingThenGlobalFeedTrendingPaginationQuery.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import { useTrackLoadMoreFeedEvents } from './analytics';
import { ITEMS_PER_PAGE } from './constants';
import FeedList from './FeedList';

type Props = {
  queryRef: TrendingThenGlobalFeedFragment$key;
};

export default function TrendingThenGlobalFeed({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment TrendingThenGlobalFeedFragment on Query {
        ...FeedListFragment

        ...TrendingThenGlobalFeedGlobalFragment
        ...TrendingThenGlobalFeedTrendingFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const globalPagination = usePaginationFragment<
    TrendingThenGlobalFeedGlobalPaginationQuery,
    TrendingThenGlobalFeedGlobalFragment$key
  >(
    graphql`
      fragment TrendingThenGlobalFeedGlobalFragment on Query
      @refetchable(queryName: "TrendingThenGlobalFeedGlobalPaginationQuery") {
        globalFeed(before: $globalBefore, last: $globalLast)
          @connection(key: "NonAuthedFeed_globalFeed") {
          edges {
            node {
              ... on FeedEventOrError {
                __typename

                ...FeedListEventDataFragment
              }
            }
          }
        }

        ...FeedListFragment
      }
    `,
    query
  );

  const trendingPagination = usePaginationFragment<
    TrendingThenGlobalFeedTrendingPaginationQuery,
    TrendingThenGlobalFeedTrendingFragment$key
  >(
    graphql`
      fragment TrendingThenGlobalFeedTrendingFragment on Query
      @refetchable(queryName: "TrendingThenGlobalFeedTrendingPaginationQuery") {
        trendingFeed(before: $trendingBefore, last: $trendingLast)
          @connection(key: "NonAuthedFeed_trendingFeed") {
          edges {
            node {
              ... on FeedEventOrError {
                __typename

                ...FeedListEventDataFragment
              }
            }
          }
        }

        ...FeedListFragment
      }
    `,
    query
  );

  const isKoalaEnabled = isFeatureEnabled(FeatureFlag.KOALA, query);

  const feedData = useMemo(() => {
    const events = [];

    const joined = [...(trendingPagination.data.trendingFeed?.edges ?? [])];

    if (!trendingPagination.hasPrevious) {
      // These get displayed in reverse order so we need to put the global stuff
      // at the beginning of the list
      joined.unshift(...(globalPagination.data.globalFeed?.edges ?? []));
    }

    for (const edge of joined) {
      if (
        (edge?.node?.__typename === 'FeedEvent' ||
          (edge?.node?.__typename === 'Post' && isKoalaEnabled)) &&
        edge.node
      ) {
        events.push(edge.node);
      }
    }

    return events;
  }, [
    globalPagination.data.globalFeed?.edges,
    isKoalaEnabled,
    trendingPagination.data.trendingFeed?.edges,
    trendingPagination.hasPrevious,
  ]);

  const hasPrevious = trendingPagination.hasPrevious || globalPagination.hasPrevious;

  const trackLoadMoreFeedEvents = useTrackLoadMoreFeedEvents();

  const loadNextPage = useCallback(() => {
    return new Promise<void>((resolve) => {
      trackLoadMoreFeedEvents('trending');
      // Infinite scroll component wants load callback to return a promise
      if (trendingPagination.hasPrevious) {
        trendingPagination.loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve() });
      } else if (globalPagination.hasPrevious) {
        globalPagination.loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve() });
      }
    });
  }, [globalPagination, trackLoadMoreFeedEvents, trendingPagination]);

  return (
    <FeedList
      queryRef={query}
      feedEventRefs={feedData}
      loadNextPage={loadNextPage}
      hasNext={hasPrevious}
      feedMode={'WORLDWIDE'}
    />
  );
}

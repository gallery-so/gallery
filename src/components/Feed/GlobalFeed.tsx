import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { GlobalFeedFragment$key } from '~/generated/GlobalFeedFragment.graphql';
import { GlobalFeedGlobalFragment$key } from '~/generated/GlobalFeedGlobalFragment.graphql';
import { GlobalFeedGlobalPaginationQuery } from '~/generated/GlobalFeedGlobalPaginationQuery.graphql';
import { GlobalFeedTrendingFragment$key } from '~/generated/GlobalFeedTrendingFragment.graphql';
import { GlobalFeedTrendingPaginationQuery } from '~/generated/GlobalFeedTrendingPaginationQuery.graphql';

import { useTrackLoadMoreFeedEvents } from './analytics';
import { ITEMS_PER_PAGE } from './constants';
import FeedList from './FeedList';

type Props = {
  queryRef: GlobalFeedGlobalFragment$key & GlobalFeedTrendingFragment$key & GlobalFeedFragment$key;
};

export default function GlobalFeed({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GlobalFeedFragment on Query {
        ...FeedListFragment
      }
    `,
    queryRef
  );

  const globalPagination = usePaginationFragment<
    GlobalFeedGlobalPaginationQuery,
    GlobalFeedGlobalFragment$key
  >(
    graphql`
      fragment GlobalFeedGlobalFragment on Query
      @refetchable(queryName: "GlobalFeedGlobalPaginationQuery") {
        globalFeed(before: $globalBefore, last: $globalLast)
          @connection(key: "GlobalFeed_globalFeed") {
          edges {
            node {
              ... on FeedEvent {
                __typename

                ...FeedListEventDataFragment
              }
            }
          }
        }

        ...FeedListFragment
      }
    `,
    queryRef
  );

  const trendingPagination = usePaginationFragment<
    GlobalFeedTrendingPaginationQuery,
    GlobalFeedTrendingFragment$key
  >(
    graphql`
      fragment GlobalFeedTrendingFragment on Query
      @refetchable(queryName: "GlobalFeedTrendingPaginationQuery") {
        trendingFeed(before: $globalBefore, last: $globalLast)
          @connection(key: "GlobalFeed_trendingFeed") {
          edges {
            node {
              ... on FeedEvent {
                __typename

                ...FeedListEventDataFragment
              }
            }
          }
        }

        ...FeedListFragment
      }
    `,
    queryRef
  );

  const feedData = useMemo(() => {
    const events = [];

    const joined = [...(trendingPagination.data.trendingFeed?.edges ?? [])];

    if (!trendingPagination.hasPrevious) {
      // These get displayed in reverse order so we need to put the global stuff
      // at the beginning of the list
      joined.unshift(...(globalPagination.data.globalFeed?.edges ?? []));
    }

    for (const edge of joined) {
      if (edge?.node?.__typename === 'FeedEvent' && edge.node) {
        events.push(edge.node);
      }
    }

    return events;
  }, [globalPagination.data.globalFeed?.edges, trendingPagination.data.trendingFeed?.edges]);

  const hasPrevious = trendingPagination.hasPrevious || globalPagination.hasPrevious;

  const trackLoadMoreFeedEvents = useTrackLoadMoreFeedEvents();

  const loadNextPage = useCallback(() => {
    return new Promise<void>((resolve) => {
      trackLoadMoreFeedEvents('global');
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

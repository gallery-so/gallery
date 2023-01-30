import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { NonAuthedFeedFragment$key } from '~/generated/NonAuthedFeedFragment.graphql';
import { NonAuthedFeedGlobalFragment$key } from '~/generated/NonAuthedFeedGlobalFragment.graphql';
import { NonAuthedFeedGlobalPaginationQuery } from '~/generated/NonAuthedFeedGlobalPaginationQuery.graphql';
import { NonAuthedFeedTrendingFragment$key } from '~/generated/NonAuthedFeedTrendingFragment.graphql';
import { NonAuthedFeedTrendingPaginationQuery } from '~/generated/NonAuthedFeedTrendingPaginationQuery.graphql';

import { useTrackLoadMoreFeedEvents } from './analytics';
import { ITEMS_PER_PAGE } from './constants';
import FeedList from './FeedList';

type Props = {
  queryRef: NonAuthedFeedGlobalFragment$key &
    NonAuthedFeedTrendingFragment$key &
    NonAuthedFeedFragment$key;
};

export default function NonAuthedFeed({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment NonAuthedFeedFragment on Query {
        ...FeedListFragment
      }
    `,
    queryRef
  );

  const globalPagination = usePaginationFragment<
    NonAuthedFeedGlobalPaginationQuery,
    NonAuthedFeedGlobalFragment$key
  >(
    graphql`
      fragment NonAuthedFeedGlobalFragment on Query
      @refetchable(queryName: "NonAuthedFeedGlobalPaginationQuery") {
        globalFeed(before: $globalBefore, last: $globalLast)
          @connection(key: "NonAuthedFeed_globalFeed") {
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
    NonAuthedFeedTrendingPaginationQuery,
    NonAuthedFeedTrendingFragment$key
  >(
    graphql`
      fragment NonAuthedFeedTrendingFragment on Query
      @refetchable(queryName: "NonAuthedFeedTrendingPaginationQuery") {
        trendingFeed(before: $globalBefore, last: $globalLast)
          @connection(key: "NonAuthedFeed_trendingFeed") {
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

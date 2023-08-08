import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { CuratedThenGlobalFeedFragment$key } from '~/generated/CuratedThenGlobalFeedFragment.graphql';
import { CuratedThenGlobalFeedGlobalFragment$key } from '~/generated/CuratedThenGlobalFeedGlobalFragment.graphql';
import { CuratedThenGlobalFeedGlobalPaginationQuery } from '~/generated/CuratedThenGlobalFeedGlobalPaginationQuery.graphql';
import { CuratedThenGlobalFeedTrendingFragment$key } from '~/generated/CuratedThenGlobalFeedTrendingFragment.graphql';
import { CuratedThenGlobalFeedTrendingPaginationQuery } from '~/generated/CuratedThenGlobalFeedTrendingPaginationQuery.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import { useTrackLoadMoreFeedEvents } from './analytics';
import { ITEMS_PER_PAGE } from './constants';
import FeedList from './FeedList';

type Props = {
  queryRef: CuratedThenGlobalFeedFragment$key;
};

export default function CuratedThenGlobalFeed({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CuratedThenGlobalFeedFragment on Query {
        ...FeedListFragment

        ...CuratedThenGlobalFeedGlobalFragment
        ...CuratedThenGlobalFeedTrendingFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const globalPagination = usePaginationFragment<
    CuratedThenGlobalFeedGlobalPaginationQuery,
    CuratedThenGlobalFeedGlobalFragment$key
  >(
    graphql`
      fragment CuratedThenGlobalFeedGlobalFragment on Query
      @refetchable(queryName: "CuratedThenGlobalFeedGlobalPaginationQuery") {
        globalFeed(before: $globalBefore, last: $globalLast, includePosts: $includePosts)
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
    CuratedThenGlobalFeedTrendingPaginationQuery,
    CuratedThenGlobalFeedTrendingFragment$key
  >(
    graphql`
      fragment CuratedThenGlobalFeedTrendingFragment on Query
      @refetchable(queryName: "CuratedThenGlobalFeedTrendingPaginationQuery") {
        curatedFeed(before: $trendingBefore, last: $trendingLast, includePosts: $includePosts)
          @connection(key: "NonAuthedFeed_curatedFeed") {
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

    const joined = [...(trendingPagination.data.curatedFeed?.edges ?? [])];

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
    trendingPagination.data.curatedFeed?.edges,
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

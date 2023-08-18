import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { CuratedFeedFragment$key } from '~/generated/CuratedFeedFragment.graphql';
import { CuratedFeedGlobalFragment$key } from '~/generated/CuratedFeedGlobalFragment.graphql';
import { CuratedFeedGlobalPaginationQuery } from '~/generated/CuratedFeedGlobalPaginationQuery.graphql';
import { CuratedFeedPaginationFragment$key } from '~/generated/CuratedFeedPaginationFragment.graphql';
import { CuratedFeedPaginationQuery } from '~/generated/CuratedFeedPaginationQuery.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import { useTrackLoadMoreFeedEvents } from './analytics';
import { ITEMS_PER_PAGE } from './constants';
import FeedList from './FeedList';

type Props = {
  queryRef: CuratedFeedFragment$key;
};

export default function CuratedFeed({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CuratedFeedFragment on Query {
        ...FeedListFragment

        ...CuratedFeedGlobalFragment
        ...CuratedFeedPaginationFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const globalPagination = usePaginationFragment<
    CuratedFeedGlobalPaginationQuery,
    CuratedFeedGlobalFragment$key
  >(
    graphql`
      fragment CuratedFeedGlobalFragment on Query
      @refetchable(queryName: "CuratedFeedGlobalPaginationQuery") {
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

  const curatedPagination = usePaginationFragment<
    CuratedFeedPaginationQuery,
    CuratedFeedPaginationFragment$key
  >(
    graphql`
      fragment CuratedFeedPaginationFragment on Query
      @refetchable(queryName: "CuratedFeedPaginationQuery") {
        curatedFeed(before: $curatedBefore, last: $curatedLast, includePosts: $includePosts)
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

    const joined = [...(curatedPagination.data.curatedFeed?.edges ?? [])];

    if (!curatedPagination.hasPrevious) {
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
    curatedPagination.data.curatedFeed?.edges,
    curatedPagination.hasPrevious,
  ]);

  const hasPrevious = curatedPagination.hasPrevious || globalPagination.hasPrevious;

  const trackLoadMoreFeedEvents = useTrackLoadMoreFeedEvents();

  const loadNextPage = useCallback(() => {
    return new Promise<void>((resolve) => {
      trackLoadMoreFeedEvents('curated');
      // Infinite scroll component wants load callback to return a promise
      if (curatedPagination.hasPrevious) {
        curatedPagination.loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve() });
      } else if (globalPagination.hasPrevious) {
        globalPagination.loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve() });
      }
    });
  }, [globalPagination, trackLoadMoreFeedEvents, curatedPagination]);

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

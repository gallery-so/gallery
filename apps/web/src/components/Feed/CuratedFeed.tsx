import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { CuratedFeedFragment$key } from '~/generated/CuratedFeedFragment.graphql';
import { CuratedFeedPaginationFragment$key } from '~/generated/CuratedFeedPaginationFragment.graphql';
import { CuratedFeedPaginationQuery } from '~/generated/CuratedFeedPaginationQuery.graphql';

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

        ...CuratedFeedPaginationFragment
      }
    `,
    queryRef
  );

  const curatedPagination = usePaginationFragment<
    CuratedFeedPaginationQuery,
    CuratedFeedPaginationFragment$key
  >(
    graphql`
      fragment CuratedFeedPaginationFragment on Query
      @refetchable(queryName: "CuratedFeedPaginationQuery") {
        curatedFeed(before: $curatedBefore, last: $curatedLast)
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

  const feedData = useMemo(() => {
    const events = [];

    const joined = [...(curatedPagination.data.curatedFeed?.edges ?? [])];

    for (const edge of joined) {
      if (
        (edge?.node?.__typename === 'FeedEvent' || edge?.node?.__typename === 'Post') &&
        edge.node
      ) {
        events.push(edge.node);
      }
    }

    return events;
  }, [curatedPagination.data.curatedFeed?.edges]);

  const hasPrevious = curatedPagination.hasPrevious;

  const trackLoadMoreFeedEvents = useTrackLoadMoreFeedEvents();

  const loadNextPage = useCallback(() => {
    return new Promise<void>((resolve) => {
      trackLoadMoreFeedEvents('curated');
      // Infinite scroll component wants load callback to return a promise
      if (curatedPagination.hasPrevious) {
        curatedPagination.loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve() });
      }
    });
  }, [trackLoadMoreFeedEvents, curatedPagination]);

  return (
    <FeedList
      queryRef={query}
      feedEventRefs={feedData}
      loadNextPage={loadNextPage}
      hasNext={hasPrevious}
      feedMode={'WORLDWIDE'}
      showSuggestedProfiles={true}
    />
  );
}

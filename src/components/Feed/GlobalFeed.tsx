import { useCallback, useMemo } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { GlobalFeedFragment$key } from '__generated__/GlobalFeedFragment.graphql';
import { GlobalFeedPaginationQuery } from '__generated__/GlobalFeedPaginationQuery.graphql';
import { useTrackLoadMoreFeedEvents } from './analytics';
import { ITEMS_PER_PAGE } from './constants';

import FeedList from './FeedList';

type Props = {
  queryRef: GlobalFeedFragment$key;
};

export default function GlobalFeed({ queryRef }: Props) {
  const {
    data: query,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment<GlobalFeedPaginationQuery, GlobalFeedFragment$key>(
    graphql`
      fragment GlobalFeedFragment on Query @refetchable(queryName: "GlobalFeedPaginationQuery") {
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

  const feedData = useMemo(() => {
    const events = [];

    for (const edge of query?.globalFeed?.edges ?? []) {
      if (edge?.node?.__typename === 'FeedEvent' && edge.node) {
        events.push(edge.node);
      }
    }

    return events;
  }, [query?.globalFeed?.edges]);

  const trackLoadMoreFeedEvents = useTrackLoadMoreFeedEvents();

  const loadNextPage = useCallback(() => {
    return new Promise((resolve) => {
      trackLoadMoreFeedEvents('global');
      // Infinite scroll component wants load callback to return a promise
      loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve('loaded') });
    });
  }, [loadPrevious, trackLoadMoreFeedEvents]);

  return (
    <StyledGlobalFeed>
      <FeedList
        queryRef={query}
        feedEventRefs={feedData}
        loadNextPage={loadNextPage}
        hasNext={hasPrevious}
        feedMode={'WORLDWIDE'}
      />
    </StyledGlobalFeed>
  );
}

const StyledGlobalFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

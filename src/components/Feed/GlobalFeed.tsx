import { useCallback } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { GlobalFeedQuery } from '__generated__/GlobalFeedQuery.graphql';
import { useTrackLoadMoreFeedEvents } from './analytics';

import FeedList from './FeedList';

const ITEMS_PER_PAGE = 24;

export default function GlobalFeed() {
  const query = useLazyLoadQuery<GlobalFeedQuery>(
    graphql`
      query GlobalFeedQuery($before: String, $last: Int) {
        ...GlobalFeedFragment
        ...FeedEventQueryFragment
      }
    `,
    {
      last: ITEMS_PER_PAGE,
    }
  );

  const { data, hasPrevious, loadPrevious, isLoadingPrevious } = usePaginationFragment<
    GlobalFeedQuery,
    any
  >(
    graphql`
      fragment GlobalFeedFragment on Query @refetchable(queryName: "GlobalFeedPaginationQuery") {
        globalFeed(before: $before, last: $last) @connection(key: "GlobalFeed_globalFeed") {
          edges {
            node {
              ... on FeedEvent {
                dbid
                eventData {
                  eventTime
                  ...FeedEventFragment
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            size
          }
        }
      }
    `,
    query
  );
  const trackLoadMoreFeedEvents = useTrackLoadMoreFeedEvents();

  const loadNextPage = useCallback(() => {
    trackLoadMoreFeedEvents('global');
    loadPrevious(ITEMS_PER_PAGE);
  }, [loadPrevious, trackLoadMoreFeedEvents]);

  return (
    <StyledGlobalFeed>
      <FeedList
        queryRef={query}
        feedData={data.globalFeed}
        loadNextPage={loadNextPage}
        hasNext={hasPrevious}
        isNextPageLoading={isLoadingPrevious}
        feedMode={'WORLDWIDE'}
      />
    </StyledGlobalFeed>
  );
}

const StyledGlobalFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

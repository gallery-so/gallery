import { useCallback } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { GlobalFeedQuery } from '__generated__/GlobalFeedQuery.graphql';
import { WORLDWIDE } from './Feed';

import FeedList from './FeedList';

export default function GlobalFeed() {
  const ITEMS_PER_PAGE = 10;
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

  const onLoadNext = useCallback(() => {
    return new Promise((resolve) => {
      // Infite scroll component wants load callback to return a promise
      loadPrevious(10, { onComplete: () => resolve('loaded') });
    });
  }, [loadPrevious]);

  return (
    <StyledGlobalFeed>
      <FeedList
        queryRef={query}
        feedData={data.globalFeed}
        onLoadNext={onLoadNext}
        hasNext={hasPrevious}
        isNextPageLoading={isLoadingPrevious}
        feedMode={WORLDWIDE}
      />
    </StyledGlobalFeed>
  );
}

const StyledGlobalFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

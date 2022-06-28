import { useCallback } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { GlobalFeedQuery } from '__generated__/GlobalFeedQuery.graphql';

import FeedList from './FeedList';

export default function GlobalFeed() {
  const last = 10;
  const query = useLazyLoadQuery<GlobalFeedQuery>(
    graphql`
      query GlobalFeedQuery($before: String, $last: Int) {
        ...GlobalFeedFragment
      }
    `,
    {
      last: last,
    }
  );

  const { data, loadNext, hasNext, hasPrevious, loadPrevious, isLoadingPrevious } =
    usePaginationFragment<GlobalFeedQuery, _>(
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
  // console.log('data, data', data.globalFeed.node.eventData);

  const onLoadNext = useCallback(() => {
    loadPrevious(10);
  }, [loadPrevious]);

  return (
    <StyledGlobalFeed>
      <FeedList feedData={data.globalFeed} onLoadNext={onLoadNext} hasNext={hasPrevious} />
    </StyledGlobalFeed>
  );
}

const StyledGlobalFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

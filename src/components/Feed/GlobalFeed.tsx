import { useCallback } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import useDisplayFullPageNftDetailModal from 'scenes/NftDetailPage/useDisplayFullPageNftDetailModal';
import styled from 'styled-components';
import { GlobalFeedQuery } from '__generated__/GlobalFeedQuery.graphql';

import FeedList from './FeedList';

export default function GlobalFeed() {
  const first = 10;
  const query = useLazyLoadQuery<GlobalFeedQuery>(
    graphql`
      query GlobalFeedQuery($after: String, $first: Int) {
        ...GlobalFeedFragment
      }
    `,
    {
      first: first,
    }
  );

  const { data, loadNext, hasNext } = usePaginationFragment<GlobalFeedQuery, _>(
    graphql`
      fragment GlobalFeedFragment on Query @refetchable(queryName: "GlobalFeedPaginationQuery") {
        globalFeed(after: $after, first: $first) @connection(key: "GlobalFeed_globalFeed") {
          edges {
            node {
              ... on FeedEvent {
                dbid
                eventData {
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

  useDisplayFullPageNftDetailModal();

  const onLoadNext = useCallback(() => {
    loadNext(10);
  }, [loadNext]);

  return (
    <StyledGlobalFeed>
      <FeedList feedData={data.globalFeed} onLoadNext={onLoadNext} hasNext={hasNext} />
    </StyledGlobalFeed>
  );
}

const StyledGlobalFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

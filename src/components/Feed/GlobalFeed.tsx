import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import { useCallback } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import useDisplayFullPageNftDetailModal from 'scenes/NftDetailPage/useDisplayFullPageNftDetailModal';
import styled from 'styled-components';
import { GlobalFeedQuery } from '__generated__/GlobalFeedQuery.graphql';
import FeedEvent from './FeedEvent';

export default function GlobalFeed() {
  const pagination = {
    // limit: 4,
  };
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

  console.log('globalFeed', data, loadNext);
  useDisplayFullPageNftDetailModal();

  const handleClick = useCallback(() => {
    loadNext(10);
  }, [loadNext]);
  // if hasNextPage show button
  return (
    <StyledGlobalFeed>
      {data.globalFeed.edges.map((eventEdge) => (
        <>
          <FeedEvent queryRef={eventEdge.node.eventData} key={eventEdge.node.dbid} />
          <Spacer height={12} />
        </>
      ))}
      {hasNext && <Button text="More" onClick={handleClick} />}
    </StyledGlobalFeed>
  );
}

const StyledGlobalFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

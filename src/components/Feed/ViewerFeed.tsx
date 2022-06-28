import Spacer from 'components/core/Spacer/Spacer';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { ViewerFeedQuery } from '__generated__/ViewerFeedQuery.graphql';
import FeedEvent from './FeedEvent';

export default function ViewerFeed() {
  const { viewer } = useLazyLoadQuery<Viewer>(
    graphql`
      query ViewerFeedViewerQuery {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    {}
  );

  const first = 10;
  const userId = viewer.user.dbid;
  const query = useLazyLoadQuery<ViewerFeedQuery>(
    graphql`
      query ViewerFeedQuery($userId: DBID!, $after: String, $first: Int) {
        ...ViewerFeedFragment
      }
    `,
    {
      first: first,
      userId,
    }
  );

  //     # @argumentDefinitions(first: { type: Int, defaultValue: 5 }, after: { type: String })
  const { data, loadNext, hasNext } = usePaginationFragment(
    // const result = useFragment(
    graphql`
      fragment ViewerFeedFragment on Query @refetchable(queryName: "FeedByUserIdPaginationQuery") {
        feedByUserId(userId: $userId, after: $after, first: $first)
          @connection(key: "FeedByUserId_feedByUserId") {
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

  console.log('data', data);
  return (
    <StyledViewerFeed>
      {data.feedByUserId.edges.map((eventEdge) => (
        <>
          <FeedEvent queryRef={eventEdge.node.eventData} key={eventEdge.node.dbid} />
          <Spacer height={12} />
        </>
      ))}
    </StyledViewerFeed>
  );
}

const StyledViewerFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

import { useCallback } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { ViewerFeedQuery } from '__generated__/ViewerFeedQuery.graphql';

import FeedList from './FeedList';

export default function ViewerFeed({ viewerUserId }: { viewerUserId: string }) {
  // const { viewer } = useLazyLoadQuery<Viewer>(
  //   graphql`
  //     query ViewerFeedViewerQuery {
  //       viewer {
  //         ... on Viewer {
  //           user {
  //             dbid
  //           }
  //         }
  //       }
  //     }
  //   `,
  //   {}
  // );

  const first = 10;
  // const userId = viewer.user.dbid;
  const query = useLazyLoadQuery<ViewerFeedQuery>(
    graphql`
      query ViewerFeedQuery($userId: DBID!, $after: String, $first: Int) {
        ...ViewerFeedFragment
      }
    `,
    {
      first: first,
      userId: viewerUserId,
    }
  );

  const { data, loadNext, hasNext } = usePaginationFragment(
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

  const onLoadNext = useCallback(() => {
    loadNext(10);
  }, [loadNext]);

  return (
    <StyledViewerFeed>
      <FeedList feedData={data.feedByUserId} onLoadNext={onLoadNext} hasNext={hasNext} />
    </StyledViewerFeed>
  );
}

const StyledViewerFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

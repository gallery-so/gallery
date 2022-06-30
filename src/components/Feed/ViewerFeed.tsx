import { useCallback } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { ViewerFeedQuery } from '__generated__/ViewerFeedQuery.graphql';
import { FOLLOWING } from './Feed';

import FeedList from './FeedList';

const ITEMS_PER_PAGE = 10;
export default function ViewerFeed({ viewerUserId }: { viewerUserId: string }) {
  const query = useLazyLoadQuery<ViewerFeedQuery>(
    graphql`
      query ViewerFeedQuery($userId: DBID!, $before: String, $last: Int) {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
        ...FeedEventQueryFragment
        ...ViewerFeedFragment
      }
    `,
    {
      last: ITEMS_PER_PAGE,
      userId: viewerUserId,
    }
  );

  const { data, loadPrevious, hasPrevious, isLoadingPrevious } = usePaginationFragment<
    ViewerFeedQuery,
    any
  >(
    graphql`
      fragment ViewerFeedFragment on Query @refetchable(queryName: "FeedByUserIdPaginationQuery") {
        feedByUserId(id: $userId, before: $before, last: $last)
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
    return new Promise((resolve) => {
      // Infite scroll component wants load callback to return a promise
      loadPrevious(10, { onComplete: () => resolve('loaded') });
    });
  }, [loadPrevious]);

  return (
    <StyledViewerFeed>
      <FeedList
        feedData={data.feedByUserId}
        onLoadNext={onLoadNext}
        hasNext={hasPrevious}
        queryRef={query}
        isNextPageLoading={isLoadingPrevious}
        feedMode={FOLLOWING}
      />
    </StyledViewerFeed>
  );
}

const StyledViewerFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

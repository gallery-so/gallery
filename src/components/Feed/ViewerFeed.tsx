import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleDiatypeL } from 'components/core/Text/Text';
import { useCallback } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { ViewerFeedQuery } from '__generated__/ViewerFeedQuery.graphql';
import { FeedMode } from './Feed';

import FeedList from './FeedList';

type Props = {
  viewerUserId: string;
  setFeedMode: (feedMode: FeedMode) => void;
};

const ITEMS_PER_PAGE = 24;
export default function ViewerFeed({ viewerUserId, setFeedMode }: Props) {
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

  const noViewerFeedEvents = !data.feedByUserId.edges.length;

  const handleSeeWorldwideClick = useCallback(() => setFeedMode('WORLDWIDE'), [setFeedMode]);

  return (
    <StyledViewerFeed>
      {noViewerFeedEvents ? (
        <StyledEmptyFeed>
          <TitleDiatypeL>Nothing here yet</TitleDiatypeL>
          <StyledEmptyFeedBody>
            Find new collectors to follow in the worldwide feed.
          </StyledEmptyFeedBody>
          <Spacer height={12} />
          <Button
            type="secondary"
            text="See worldwide activity"
            onClick={handleSeeWorldwideClick}
          />
        </StyledEmptyFeed>
      ) : (
        <FeedList
          feedData={data.feedByUserId}
          onLoadNext={onLoadNext}
          hasNext={hasPrevious}
          queryRef={query}
          isNextPageLoading={isLoadingPrevious}
          feedMode={'FOLLOWING'}
        />
      )}
    </StyledViewerFeed>
  );
}

const StyledViewerFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEmptyFeed = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 35vh;
`;

const StyledEmptyFeedBody = styled(BaseM)`
  width: 194px;
  text-align: center;
`;

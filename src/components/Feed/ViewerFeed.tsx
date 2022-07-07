import Button from 'components/core/Button/DeprecatedButton';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleDiatypeL } from 'components/core/Text/Text';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useCallback } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { ViewerFeedQuery } from '__generated__/ViewerFeedQuery.graphql';
import { useTrackLoadMoreFeedEvents } from './analytics';
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

  const { data, loadPrevious, hasPrevious } = usePaginationFragment<ViewerFeedQuery, any>(
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

  const trackLoadMoreFeedEvents = useTrackLoadMoreFeedEvents();

  const loadNextPage = useCallback(() => {
    return new Promise((resolve) => {
      trackLoadMoreFeedEvents('viewer');
      // Infinite scroll component wants load callback to return a promise
      loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve('loaded') });
    });
  }, [loadPrevious, trackLoadMoreFeedEvents]);

  const noViewerFeedEvents = !data.feedByUserId.edges.length;

  const track = useTrack();

  const handleSeeWorldwideClick = useCallback(() => {
    track('Feed: Clicked worldwide button from inbox zero');
    setFeedMode('WORLDWIDE');
  }, [setFeedMode, track]);

  return (
    <StyledViewerFeed>
      {noViewerFeedEvents ? (
        <StyledEmptyFeed>
          <TitleDiatypeL>It's quiet in here</TitleDiatypeL>
          <StyledEmptyFeedBody>
            Discover new collectors to follow in the worldwide feed.
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
          loadNextPage={loadNextPage}
          hasNext={hasPrevious}
          queryRef={query}
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

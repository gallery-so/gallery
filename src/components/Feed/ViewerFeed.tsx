import { useMemo } from 'react';
import { Button } from 'components/core/Button/Button';
import { BaseM, TitleDiatypeL } from 'components/core/Text/Text';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useCallback } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';
import { FeedByUserIdPaginationQuery } from '__generated__/FeedByUserIdPaginationQuery.graphql';
import { ViewerFeedFragment$key } from '__generated__/ViewerFeedFragment.graphql';
import { useTrackLoadMoreFeedEvents } from './analytics';
import { FeedMode } from './Feed';

import FeedList from './FeedList';
import { ITEMS_PER_PAGE } from './constants';
import { Spacer, VStack } from 'components/core/Spacer/Stack';

type Props = {
  queryRef: ViewerFeedFragment$key;
  setFeedMode: (feedMode: FeedMode) => void;
};

export default function ViewerFeed({ setFeedMode, queryRef }: Props) {
  const {
    data: query,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment<FeedByUserIdPaginationQuery, ViewerFeedFragment$key>(
    graphql`
      fragment ViewerFeedFragment on Query @refetchable(queryName: "FeedByUserIdPaginationQuery") {
        ...FeedListFragment

        viewer {
          ... on Viewer {
            feed(before: $viewerBefore, last: $viewerLast)
              @connection(key: "ViewerFeedFragment_feed") {
              edges {
                node {
                  ... on FeedEvent {
                    __typename
                    eventData {
                      ...FeedListEventDataFragment
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const trackLoadMoreFeedEvents = useTrackLoadMoreFeedEvents();

  const loadNextPage = useCallback(() => {
    return new Promise((resolve) => {
      trackLoadMoreFeedEvents('viewer');
      // Infinite scroll component wants load callback to return a promise
      loadPrevious(ITEMS_PER_PAGE, { onComplete: () => resolve('loaded') });
    });
  }, [loadPrevious, trackLoadMoreFeedEvents]);

  const noViewerFeedEvents = !query.viewer?.feed?.edges?.length;

  const track = useTrack();

  const handleSeeWorldwideClick = useCallback(() => {
    track('Feed: Clicked worldwide button from inbox zero');
    setFeedMode('WORLDWIDE');
  }, [setFeedMode, track]);

  const feedData = useMemo(() => {
    const events = [];

    for (const edge of query.viewer?.feed?.edges ?? []) {
      if (edge?.node?.__typename === 'FeedEvent' && edge.node.eventData) {
        events.push(edge.node.eventData);
      }
    }

    return events;
  }, [query.viewer?.feed?.edges]);

  return (
    <StyledViewerFeed>
      {noViewerFeedEvents ? (
        <StyledEmptyFeed gap={12}>
          <VStack align="center">
            <TitleDiatypeL>It's quiet in here</TitleDiatypeL>
            <StyledEmptyFeedBody>
              Discover new collectors to follow in the worldwide feed.
            </StyledEmptyFeedBody>
          </VStack>
          <Button variant="secondary" onClick={handleSeeWorldwideClick}>
            See worldwide activity
          </Button>
        </StyledEmptyFeed>
      ) : (
        <VStack gap={24}>
          <Spacer />
          <FeedList
            feedEventRefs={feedData}
            loadNextPage={loadNextPage}
            hasNext={hasPrevious}
            queryRef={query}
            feedMode={'FOLLOWING'}
          />
        </VStack>
      )}
    </StyledViewerFeed>
  );
}

const StyledViewerFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEmptyFeed = styled(VStack)`
  align-items: center;
  justify-content: center;
  padding-top: 35vh;
`;

const StyledEmptyFeedBody = styled(BaseM)`
  width: 194px;
  text-align: center;
`;

import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListItemFragment$key } from '~/generated/FeedListItemFragment.graphql';

import { ReportingErrorBoundary } from '../ReportingErrorBoundary';
import { GalleryUpdatedFeedEvent } from './GalleryUpdatedFeedEvent';

type FeedListItemProps = {
  feedEventRef: FeedListItemFragment$key;
};

export function FeedListItem({ feedEventRef }: FeedListItemProps) {
  const feedEvent = useFragment(
    graphql`
      fragment FeedListItemFragment on FeedEvent {
        eventData {
          ... on GalleryUpdatedFeedEventData {
            __typename
            ...GalleryUpdatedFeedEventFragment
          }
        }
      }
    `,
    feedEventRef
  );

  const content = useMemo(() => {
    if (feedEvent.eventData?.__typename === 'GalleryUpdatedFeedEventData') {
      return <GalleryUpdatedFeedEvent galleryUpdatedFeedEventDataRef={feedEvent.eventData} />;
    }

    return null;
  }, [feedEvent.eventData]);

  return (
    <ReportingErrorBoundary dontReport fallback={null}>
      {content}
    </ReportingErrorBoundary>
  );
}

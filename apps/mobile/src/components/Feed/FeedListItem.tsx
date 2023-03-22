import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListItemFragment$key } from '~/generated/FeedListItemFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { GalleryUpdatedFeedEvent } from './GalleryUpdatedFeedEvent';
import { NonRecursiveFeedListItem } from './NonRecursiveFeedListItem';

type FeedListItemProps = {
  eventDataRef: FeedListItemFragment$key;
};

export function FeedListItem({ eventDataRef }: FeedListItemProps) {
  const eventData = useFragment<FeedListItemFragment$key>(
    graphql`
      fragment FeedListItemFragment on FeedEventData {
        __typename

        ... on GalleryUpdatedFeedEventData {
          __typename
          ...GalleryUpdatedFeedEventFragment
        }

        ...NonRecursiveFeedListItemFragment
      }
    `,
    eventDataRef
  );

  if (eventData.__typename === 'GalleryUpdatedFeedEventData') {
    return (
      <ReportingErrorBoundary fallback={null}>
        <GalleryUpdatedFeedEvent eventDataRef={eventData} />
      </ReportingErrorBoundary>
    );
  }

  return (
    <ReportingErrorBoundary fallback={null}>
      <NonRecursiveFeedListItem eventDataRef={eventData} />
    </ReportingErrorBoundary>
  );
}

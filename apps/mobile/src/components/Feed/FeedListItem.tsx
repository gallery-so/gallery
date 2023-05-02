import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListItemFragment$key } from '~/generated/FeedListItemFragment.graphql';

import { GalleryUpdatedFeedEvent } from './Events/GalleryUpdatedFeedEvent';
import { NonRecursiveFeedListItem } from './Events/NonRecursiveFeedListItem';

type FeedListItemProps = {
  eventId: string;
  eventDataRef: FeedListItemFragment$key;
};

export function FeedListItem({ eventId, eventDataRef }: FeedListItemProps) {
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

  const inner = useMemo(() => {
    if (eventData.__typename === 'GalleryUpdatedFeedEventData') {
      return <GalleryUpdatedFeedEvent eventId={eventId} eventDataRef={eventData} />;
    }

    return (
      <NonRecursiveFeedListItem
        eventId={eventId}
        slideIndex={0}
        eventCount={1}
        eventDataRef={eventData}
      />
    );
  }, [eventData, eventId]);

  return <View className="pb-8">{inner}</View>;
}

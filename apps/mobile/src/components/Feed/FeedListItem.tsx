import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useToggleAdmire } from 'src/hooks/useToggleAdmire';

import { FeedListItemFragment$key } from '~/generated/FeedListItemFragment.graphql';
import { FeedListItemQueryFragment$key } from '~/generated/FeedListItemQueryFragment.graphql';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';

import { GalleryUpdatedFeedEvent } from './Events/GalleryUpdatedFeedEvent';
import { NonRecursiveFeedListItem } from './Events/NonRecursiveFeedListItem';

type FeedListItemProps = {
  eventId: string;
  queryRef: FeedListItemQueryFragment$key;
  eventDataRef: FeedListItemFragment$key | null;
};

export function FeedListItem({ eventId, queryRef, eventDataRef }: FeedListItemProps) {
  const query = useFragment(
    graphql`
      fragment FeedListItemQueryFragment on Query {
        ...useToggleAdmireQueryFragment
      }
    `,
    queryRef
  );

  const event = useFragment<FeedListItemFragment$key>(
    graphql`
      fragment FeedListItemFragment on FeedEvent {
        eventData {
          __typename

          ... on GalleryUpdatedFeedEventData {
            __typename
            ...GalleryUpdatedFeedEventFragment
          }

          ...NonRecursiveFeedListItemFragment
        }

        ...useToggleAdmireFragment
      }
    `,
    eventDataRef
  );

  if (!event?.eventData) {
    throw new ErrorWithSentryMetadata('Missing eventData on feed event', {});
  }

  const { toggleAdmire } = useToggleAdmire({
    eventRef: event,
    queryRef: query,
  });

  const inner = useMemo(() => {
    if (!event?.eventData) {
      return null;
    }

    if (event.eventData.__typename === 'GalleryUpdatedFeedEventData') {
      return (
        <GalleryUpdatedFeedEvent
          onAdmire={toggleAdmire}
          eventId={eventId}
          eventDataRef={event.eventData}
        />
      );
    }

    return (
      <View className="overflow-hidden">
        <NonRecursiveFeedListItem
          onAdmire={toggleAdmire}
          eventId={eventId}
          slideIndex={0}
          eventCount={1}
          eventDataRef={event.eventData}
        />
      </View>
    );
  }, [event.eventData, eventId, toggleAdmire]);

  return <View>{inner}</View>;
}

import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NonRecursiveFeedListItemFragment$key } from '~/generated/NonRecursiveFeedListItemFragment.graphql';
import { NonRecursiveFeedListItemQueryFragment$key } from '~/generated/NonRecursiveFeedListItemQueryFragment.graphql';
import { TriedToRenderUnsupportedFeedEvent } from '~/shared/errors/TriedToRenderUnsupportedFeedEvent';

import { CollectionCreatedFeedEvent } from './CollectionCreatedFeedEvent';
import { CollectionUpdatedFeedEvent } from './CollectionUpdatedFeedEvent';
import { CollectorsNoteAddedToCollectionFeedEvent } from './CollectorsNoteAddedToCollectionFeedEvent';
import { TokensAddedToCollectionFeedEvent } from './TokensAddedToCollectionFeedEvent';
import { UserFollowedUsersFeedEvent } from './UserFollowedUsersFeedEvent';

type NonRecursiveFeedListItemProps = {
  queryRef: NonRecursiveFeedListItemQueryFragment$key;
  eventId: string;
  slideIndex: number;
  eventCount: number;
  eventDataRef: NonRecursiveFeedListItemFragment$key;
  onAdmire: () => void;
};

export function NonRecursiveFeedListItem({
  queryRef,
  eventId,
  eventDataRef,
  eventCount,
  slideIndex,
  onAdmire,
}: NonRecursiveFeedListItemProps) {
  const query = useFragment(
    graphql`
      fragment NonRecursiveFeedListItemQueryFragment on Query {
        ...CollectorsNoteAddedToCollectionFeedEventQueryFragment
        ...CollectionUpdatedFeedEventQueryFragment
        ...CollectionCreatedFeedEventQueryFragment
        ...TokensAddedToCollectionFeedEventQueryFragment
      }
    `,
    queryRef
  );
  const eventData = useFragment(
    graphql`
      fragment NonRecursiveFeedListItemFragment on FeedEventData {
        __typename

        ... on CollectionUpdatedFeedEventData {
          __typename
          ...CollectionUpdatedFeedEventFragment
        }

        ... on TokensAddedToCollectionFeedEventData {
          __typename
          ...TokensAddedToCollectionFeedEventFragment
        }

        ... on CollectionCreatedFeedEventData {
          __typename
          ...CollectionCreatedFeedEventFragment
        }

        ... on CollectorsNoteAddedToCollectionFeedEventData {
          __typename
          ...CollectorsNoteAddedToCollectionFeedEventFragment
        }

        ... on UserFollowedUsersFeedEventData {
          __typename
          ...UserFollowedUsersFeedEventFragment
        }
      }
    `,
    eventDataRef
  );

  const { width } = useWindowDimensions();

  const inner = useMemo(() => {
    const allowPreserveAspectRatio = eventCount === 1;

    switch (eventData.__typename) {
      case 'CollectorsNoteAddedToCollectionFeedEventData':
        return (
          <CollectorsNoteAddedToCollectionFeedEvent
            queryRef={query}
            onDoubleTap={onAdmire}
            isFirstSlide={slideIndex === 0}
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      case 'CollectionUpdatedFeedEventData':
        return (
          <CollectionUpdatedFeedEvent
            queryRef={query}
            onDoubleTap={onAdmire}
            isFirstSlide={slideIndex === 0}
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      case 'CollectionCreatedFeedEventData':
        return (
          <CollectionCreatedFeedEvent
            queryRef={query}
            onDoubleTap={onAdmire}
            isFirstSlide={slideIndex === 0}
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      case 'TokensAddedToCollectionFeedEventData':
        return (
          <TokensAddedToCollectionFeedEvent
            queryRef={query}
            onDoubleTap={onAdmire}
            isFirstSlide={slideIndex === 0}
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      case 'UserFollowedUsersFeedEventData':
        return <UserFollowedUsersFeedEvent userFollowedUsersFeedEventDataRef={eventData} />;
      default:
        throw new TriedToRenderUnsupportedFeedEvent(eventId);
    }
  }, [eventCount, eventData, eventId, onAdmire, slideIndex]);

  return (
    <View className="flex-1" style={{ width }}>
      {inner}
    </View>
  );
}

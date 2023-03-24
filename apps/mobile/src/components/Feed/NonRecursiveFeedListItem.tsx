import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NonRecursiveFeedListItemFragment$key } from '~/generated/NonRecursiveFeedListItemFragment.graphql';

import { CollectionCreatedFeedEvent } from './CollectionCreatedFeedEvent';
import { CollectionUpdatedFeedEvent } from './CollectionUpdatedFeedEvent';
import { CollectorsNoteAddedToCollectionFeedEvent } from './CollectorsNoteAddedToCollectionFeedEvent';
import { TokensAddedToCollectionFeedEvent } from './TokensAddedToCollectionFeedEvent';

type NonRecursiveFeedListItemProps = {
  slideIndex: number;
  eventCount: number;
  eventDataRef: NonRecursiveFeedListItemFragment$key;
};

export function NonRecursiveFeedListItem({
  eventDataRef,
  eventCount,
  slideIndex,
}: NonRecursiveFeedListItemProps) {
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
            isFirstSlide={slideIndex === 0}
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      case 'CollectionUpdatedFeedEventData':
        return (
          <CollectionUpdatedFeedEvent
            isFirstSlide={slideIndex === 0}
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      case 'CollectionCreatedFeedEventData':
        return (
          <CollectionCreatedFeedEvent
            isFirstSlide={slideIndex === 0}
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      case 'TokensAddedToCollectionFeedEventData':
        return (
          <TokensAddedToCollectionFeedEvent
            isFirstSlide={slideIndex === 0}
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      default:
        return null;
    }
  }, [eventCount, eventData, slideIndex]);

  return <View style={{ width }}>{inner}</View>;
}

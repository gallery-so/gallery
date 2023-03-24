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
  eventCount: number;
  eventDataRef: NonRecursiveFeedListItemFragment$key;
};

export function NonRecursiveFeedListItem({
  eventDataRef,
  eventCount,
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
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      case 'CollectionUpdatedFeedEventData':
        return (
          <CollectionUpdatedFeedEvent
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      case 'CollectionCreatedFeedEventData':
        return (
          <CollectionCreatedFeedEvent
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      case 'TokensAddedToCollectionFeedEventData':
        return (
          <TokensAddedToCollectionFeedEvent
            allowPreserveAspectRatio={allowPreserveAspectRatio}
            collectionUpdatedFeedEventDataRef={eventData}
          />
        );
      default:
        return null;
    }
  }, [eventCount, eventData]);

  return <View style={{ width }}>{inner}</View>;
}

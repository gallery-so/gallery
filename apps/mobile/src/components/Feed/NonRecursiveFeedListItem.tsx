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
  eventDataRef: NonRecursiveFeedListItemFragment$key;
};

export function NonRecursiveFeedListItem({ eventDataRef }: NonRecursiveFeedListItemProps) {
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
    switch (eventData.__typename) {
      case 'CollectorsNoteAddedToCollectionFeedEventData':
        return (
          <CollectorsNoteAddedToCollectionFeedEvent collectionUpdatedFeedEventDataRef={eventData} />
        );
      case 'CollectionUpdatedFeedEventData':
        return <CollectionUpdatedFeedEvent collectionUpdatedFeedEventDataRef={eventData} />;
      case 'CollectionCreatedFeedEventData':
        return <CollectionCreatedFeedEvent collectionUpdatedFeedEventDataRef={eventData} />;
      case 'TokensAddedToCollectionFeedEventData':
        return <TokensAddedToCollectionFeedEvent collectionUpdatedFeedEventDataRef={eventData} />;
      default:
        return null;
    }
  }, [eventData]);

  return (
    <View className="py-3" style={{ width }}>
      {inner}
    </View>
  );
}

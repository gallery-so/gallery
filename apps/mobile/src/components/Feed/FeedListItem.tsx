import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListItemFragment$key } from '~/generated/FeedListItemFragment.graphql';

import { CollectionCreatedFeedEvent } from './CollectionCreatedFeedEvent';
import { TokensAddedToCollectionFeedEvent } from './TokensAddedToCollectionFeedEvent';

type FeedListItemProps = {
  eventDataRef: FeedListItemFragment$key;
};

export function FeedListItem({ eventDataRef }: FeedListItemProps) {
  const eventData = useFragment<FeedListItemFragment$key>(
    graphql`
      fragment FeedListItemFragment on FeedEventData {
        __typename

        ... on GalleryInfoUpdatedFeedEventData {
          __typename
        }

        ... on CollectionUpdatedFeedEventData {
          __typename
        }

        ... on TokensAddedToCollectionFeedEventData {
          __typename
          ...TokensAddedToCollectionFeedEventFragment
        }

        ... on CollectionCreatedFeedEventData {
          ...CollectionCreatedFeedEventFragment
        }
      }
    `,
    eventDataRef
  );

  const inner = useMemo(() => {
    switch (eventData.__typename) {
      case 'CollectionCreatedFeedEventData':
        return <CollectionCreatedFeedEvent collectionUpdatedFeedEventDataRef={eventData} />;
      case 'TokensAddedToCollectionFeedEventData':
        return <TokensAddedToCollectionFeedEvent collectionUpdatedFeedEventDataRef={eventData} />;
      default:
        return null;
    }
  }, [eventData]);

  return <View className="py-3">{inner}</View>;
}

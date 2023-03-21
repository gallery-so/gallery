import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CollectorsNoteAddedToCollectionFeedEventFragment$key } from '~/generated/CollectorsNoteAddedToCollectionFeedEventFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { CollectionAndAdditionCount } from './CollectionAndAdditionCount';
import { FeedListCollectorsNote } from './FeedListCollectorsNote';
import { TokenCarousel } from './TokenCarousel';

type CollectorsNoteAddedToCollectionFeedEventProps = {
  collectionUpdatedFeedEventDataRef: CollectorsNoteAddedToCollectionFeedEventFragment$key;
};

export function CollectorsNoteAddedToCollectionFeedEvent({
  collectionUpdatedFeedEventDataRef,
}: CollectorsNoteAddedToCollectionFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment CollectorsNoteAddedToCollectionFeedEventFragment on CollectorsNoteAddedToCollectionFeedEventData {
        newCollectorsNote

        collection {
          name

          tokens(limit: 4) {
            token {
              ...TokenCarouselFragment
            }
          }
        }
      }
    `,
    collectionUpdatedFeedEventDataRef
  );

  const tokens = useMemo(() => {
    return removeNullValues(
      eventData.collection?.tokens?.map((collectionToken) => collectionToken?.token)
    );
  }, [eventData.collection?.tokens]);

  return (
    <View className="flex flex-col">
      <CollectionAndAdditionCount collectionName={eventData.collection?.name} />

      {eventData.newCollectorsNote && (
        <FeedListCollectorsNote collectorsNote={eventData.newCollectorsNote} />
      )}

      <TokenCarousel tokenRefs={tokens} />
    </View>
  );
}

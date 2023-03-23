import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CollectorsNoteAddedToCollectionFeedEventFragment$key } from '~/generated/CollectorsNoteAddedToCollectionFeedEventFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { Typography } from '../Typography';
import { EventTokenGrid } from './EventTokenGrid';
import { FeedEventCarouselCellHeader } from './FeedEventCarouselCellHeader';
import { FeedListCollectorsNote } from './FeedListCollectorsNote';

type CollectorsNoteAddedToCollectionFeedEventProps = {
  allowPreserveAspectRatio: boolean;
  collectionUpdatedFeedEventDataRef: CollectorsNoteAddedToCollectionFeedEventFragment$key;
};

export function CollectorsNoteAddedToCollectionFeedEvent({
  allowPreserveAspectRatio,
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
              ...EventTokenGridFragment
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
      <FeedEventCarouselCellHeader>
        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Added a colloctors note to
        </Typography>

        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {eventData.collection?.name ?? 'Untitled'}
        </Typography>
      </FeedEventCarouselCellHeader>

      {eventData.newCollectorsNote && (
        <FeedListCollectorsNote collectorsNote={eventData.newCollectorsNote} />
      )}

      <EventTokenGrid allowPreserveAspectRatio={allowPreserveAspectRatio} tokenRefs={tokens} />
    </View>
  );
}

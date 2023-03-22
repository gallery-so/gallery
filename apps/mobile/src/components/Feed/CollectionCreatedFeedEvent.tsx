import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CollectionCreatedFeedEventFragment$key } from '~/generated/CollectionCreatedFeedEventFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { Typography } from '../Typography';
import { EventTokenGrid } from './EventTokenGrid';
import { FeedEventCarouselCellHeader } from './FeedEventCarouselCellHeader';
import { FeedListCollectorsNote } from './FeedListCollectorsNote';

type CollectionCreatedFeedEventProps = {
  collectionUpdatedFeedEventDataRef: CollectionCreatedFeedEventFragment$key;
};

export function CollectionCreatedFeedEvent({
  collectionUpdatedFeedEventDataRef,
}: CollectionCreatedFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment CollectionCreatedFeedEventFragment on CollectionCreatedFeedEventData {
        collection {
          name
          collectorsNote
        }

        newTokens {
          token {
            ...EventTokenGridFragment
          }
        }
      }
    `,
    collectionUpdatedFeedEventDataRef
  );

  const tokens = useMemo(() => {
    return removeNullValues(eventData.newTokens?.map((collectionToken) => collectionToken?.token));
  }, [eventData.newTokens]);

  return (
    <View className="flex flex-col">
      <FeedEventCarouselCellHeader>
        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Created a new collection
        </Typography>

        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {eventData.collection?.name ?? 'Untitled'}
        </Typography>
      </FeedEventCarouselCellHeader>

      {eventData.collection?.collectorsNote && (
        <FeedListCollectorsNote collectorsNote={eventData.collection.collectorsNote} />
      )}

      <EventTokenGrid tokenRefs={tokens} />
    </View>
  );
}

import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { CollectorsNoteAddedToCollectionFeedEventFragment$key } from '~/generated/CollectorsNoteAddedToCollectionFeedEventFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { Typography } from '../../Typography';
import { EventTokenGrid } from '../EventTokenGrid';
import { FeedEventCarouselCellHeader } from '../FeedEventCarouselCellHeader';
import { FeedListCollectorsNote } from '../FeedListCollectorsNote';

type CollectorsNoteAddedToCollectionFeedEventProps = {
  isFirstSlide: boolean;
  allowPreserveAspectRatio: boolean;
  collectionUpdatedFeedEventDataRef: CollectorsNoteAddedToCollectionFeedEventFragment$key;
  onDoubleTap: () => void;
};

export function CollectorsNoteAddedToCollectionFeedEvent({
  isFirstSlide,
  allowPreserveAspectRatio,
  collectionUpdatedFeedEventDataRef,
  onDoubleTap,
}: CollectorsNoteAddedToCollectionFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment CollectorsNoteAddedToCollectionFeedEventFragment on CollectorsNoteAddedToCollectionFeedEventData {
        newCollectorsNote

        collection {
          dbid
          name

          tokens(limit: 4) {
            ...EventTokenGridFragment
          }
        }
      }
    `,
    collectionUpdatedFeedEventDataRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleCollectionNamePress = useCallback(() => {
    if (eventData.collection?.dbid) {
      navigation.push('Collection', { collectionId: eventData.collection.dbid });
    }
  }, [eventData.collection?.dbid, navigation]);

  const tokens = useMemo(() => {
    return removeNullValues(eventData.collection?.tokens);
  }, [eventData.collection?.tokens]);

  return (
    <View className="flex flex-1 flex-col">
      <FeedEventCarouselCellHeader>
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Added a collector's note to
        </Typography>
        <GalleryTouchableOpacity
          className="flex-1"
          onPress={handleCollectionNamePress}
          eventElementId="Feed Collection Button"
          eventName="Feed Collection Name Clicked"
          eventContext={contexts.Feed}
        >
          <Typography
            numberOfLines={1}
            className="text-sm"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            {eventData.collection?.name || 'Untitled'}
          </Typography>
        </GalleryTouchableOpacity>
      </FeedEventCarouselCellHeader>

      {eventData.newCollectorsNote && (
        <FeedListCollectorsNote collectorsNote={eventData.newCollectorsNote} />
      )}

      <View className="flex flex-grow">
        <EventTokenGrid
          onDoubleTap={onDoubleTap}
          imagePriority={isFirstSlide ? FastImage.priority.high : FastImage.priority.normal}
          allowPreserveAspectRatio={allowPreserveAspectRatio}
          collectionTokenRefs={tokens}
        />
      </View>
    </View>
  );
}

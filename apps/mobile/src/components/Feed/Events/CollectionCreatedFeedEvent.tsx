import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { CollectionCreatedFeedEventFragment$key } from '~/generated/CollectionCreatedFeedEventFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { Typography } from '../../Typography';
import { EventTokenGrid } from '../EventTokenGrid';
import { FeedEventCarouselCellHeader } from '../FeedEventCarouselCellHeader';
import { FeedListCollectorsNote } from '../FeedListCollectorsNote';

type CollectionCreatedFeedEventProps = {
  isFirstSlide: boolean;
  allowPreserveAspectRatio: boolean;
  collectionUpdatedFeedEventDataRef: CollectionCreatedFeedEventFragment$key;
  onDoubleTap: () => void;
};

export function CollectionCreatedFeedEvent({
  isFirstSlide,
  allowPreserveAspectRatio,
  collectionUpdatedFeedEventDataRef,
  onDoubleTap,
}: CollectionCreatedFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment CollectionCreatedFeedEventFragment on CollectionCreatedFeedEventData {
        collection {
          dbid
          name
          collectorsNote
        }

        newTokens {
          ...EventTokenGridFragment
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
    return removeNullValues(eventData.newTokens);
  }, [eventData.newTokens]);

  return (
    <View className="flex flex-1">
      <FeedEventCarouselCellHeader>
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Created a new collection
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

      {eventData.collection?.collectorsNote && (
        <FeedListCollectorsNote collectorsNote={eventData.collection.collectorsNote} />
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

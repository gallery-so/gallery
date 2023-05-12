import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { CollectionUpdatedFeedEventFragment$key } from '~/generated/CollectionUpdatedFeedEventFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { Typography } from '../../Typography';
import { EventTokenGrid } from '../EventTokenGrid';
import { FeedEventCarouselCellHeader } from '../FeedEventCarouselCellHeader';
import { FeedListCollectorsNote } from '../FeedListCollectorsNote';

type CollectionUpdatedFeedEventProps = {
  isFirstSlide: boolean;
  allowPreserveAspectRatio: boolean;
  collectionUpdatedFeedEventDataRef: CollectionUpdatedFeedEventFragment$key;
};

export function CollectionUpdatedFeedEvent({
  isFirstSlide,
  allowPreserveAspectRatio,
  collectionUpdatedFeedEventDataRef,
}: CollectionUpdatedFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment CollectionUpdatedFeedEventFragment on CollectionUpdatedFeedEventData {
        newCollectorsNote

        collection {
          dbid
          name
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
    <View className="flex flex-1 flex-col">
      <FeedEventCarouselCellHeader>
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Made a change to
        </Typography>
        <GalleryTouchableOpacity className="flex-1" onPress={handleCollectionNamePress}>
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
          imagePriority={isFirstSlide ? FastImage.priority.high : FastImage.priority.normal}
          allowPreserveAspectRatio={allowPreserveAspectRatio}
          collectionTokenRefs={tokens}
        />
      </View>
    </View>
  );
}

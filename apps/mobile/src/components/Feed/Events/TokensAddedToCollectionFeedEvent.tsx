import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { TokensAddedToCollectionFeedEventFragment$key } from '~/generated/TokensAddedToCollectionFeedEventFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { Typography } from '../../Typography';
import { EventTokenGrid } from '../EventTokenGrid';
import { FeedEventCarouselCellHeader } from '../FeedEventCarouselCellHeader';

type TokensAddedToCollectionFeedEventProps = {
  isFirstSlide: boolean;
  allowPreserveAspectRatio: boolean;
  collectionUpdatedFeedEventDataRef: TokensAddedToCollectionFeedEventFragment$key;
};

export function TokensAddedToCollectionFeedEvent({
  isFirstSlide,
  allowPreserveAspectRatio,
  collectionUpdatedFeedEventDataRef,
}: TokensAddedToCollectionFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment TokensAddedToCollectionFeedEventFragment on TokensAddedToCollectionFeedEventData {
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
          Added new tokens to
        </Typography>
        <TouchableOpacity className="flex-1" onPress={handleCollectionNamePress}>
          <Typography
            numberOfLines={1}
            className="text-sm"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            {eventData.collection?.name || 'Untitled'}
          </Typography>
        </TouchableOpacity>
      </FeedEventCarouselCellHeader>

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

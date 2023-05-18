import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListSectionHeaderFragment$key } from '~/generated/FeedListSectionHeaderFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { getTimeSince } from '~/shared/utils/time';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';

type FeedListSectionHeaderProps = {
  feedEventRef: FeedListSectionHeaderFragment$key;
};

export function FeedListSectionHeader({ feedEventRef }: FeedListSectionHeaderProps) {
  const feedEvent = useFragment(
    graphql`
      fragment FeedListSectionHeaderFragment on FeedEvent {
        __typename

        eventData @required(action: THROW) {
          __typename
          eventTime

          ... on GalleryUpdatedFeedEventData {
            owner {
              username
            }

            gallery {
              dbid
              name
            }
          }
        }
      }
    `,
    feedEventRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleGalleryNamePress = useCallback(() => {
    if (feedEvent.eventData.gallery?.dbid) {
      navigation.push('Gallery', { galleryId: feedEvent.eventData.gallery?.dbid });
    }
  }, [feedEvent.eventData.gallery?.dbid, navigation]);

  const handleUsernamePress = useCallback(() => {
    if (feedEvent.eventData.owner?.username) {
      navigation.push('Profile', { username: feedEvent.eventData.owner?.username });
    }
  }, [feedEvent.eventData.owner?.username, navigation]);

  if (feedEvent.eventData?.__typename !== 'GalleryUpdatedFeedEventData') {
    return null;
  }

  return (
    <View className="flex flex-row items-center justify-between bg-white dark:bg-black px-3 pb-2">
      <View className="flex flex-row space-x-1">
        <GalleryTouchableOpacity
          onPress={handleUsernamePress}
          id="Feed Username Button"
          eventName="Feed Username Clicked"
          properties={{ variant: 'Feed event author' }}
        >
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {feedEvent.eventData.owner?.username}
          </Typography>
        </GalleryTouchableOpacity>

        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          updated
        </Typography>

        <GalleryTouchableOpacity
          onPress={handleGalleryNamePress}
          id="Feed Gallery Name Button"
          eventName="Feed Gallery Name Clicked"
        >
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {feedEvent.eventData.gallery?.name || 'their gallery'}
          </Typography>
        </GalleryTouchableOpacity>
      </View>

      <View>
        <Typography
          className="text-metal text-xs"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          {getTimeSince(feedEvent.eventData.eventTime)}
        </Typography>
      </View>
    </View>
  );
}

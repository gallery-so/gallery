import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListSectionHeaderFragment$key } from '~/generated/FeedListSectionHeaderFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { getTimeSince } from '~/shared/utils/time';

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

  if (feedEvent.eventData?.__typename === 'GalleryUpdatedFeedEventData') {
    return (
      <View className="flex flex-row items-center justify-between bg-white dark:bg-black px-3 py-2">
        <View className="flex flex-row space-x-1">
          <TouchableOpacity onPress={handleUsernamePress}>
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              {feedEvent.eventData.owner?.username}
            </Typography>
          </TouchableOpacity>

          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            updated
          </Typography>

          <TouchableOpacity onPress={handleGalleryNamePress}>
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              {feedEvent.eventData.gallery?.name || 'Untitled'}
            </Typography>
          </TouchableOpacity>
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

  return null;
}

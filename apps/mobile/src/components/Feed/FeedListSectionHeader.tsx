import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { FeedListSectionHeaderFragment$key } from '~/generated/FeedListSectionHeaderFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
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
              ...ProfilePictureFragment
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

  const galleryName = feedEvent.eventData.gallery?.name || '';

  return (
    <View className="flex flex-row items-center justify-between bg-white dark:bg-black-900 px-3 pb-2">
      <View className="flex flex-row space-x-1 items-center" style={{ maxWidth: '92%' }}>
        <GalleryTouchableOpacity
          className="flex flex-row items-center space-x-1"
          onPress={handleUsernamePress}
          eventElementId="Feed Username Button"
          eventName="Feed Username Clicked"
          eventContext={contexts.Feed}
          properties={{ variant: 'Feed event author' }}
        >
          {feedEvent.eventData.owner && (
            <ProfilePicture userRef={feedEvent.eventData.owner} size="sm" />
          )}

          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {feedEvent.eventData.owner?.username}
          </Typography>
        </GalleryTouchableOpacity>

        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          updated
        </Typography>

        <GalleryTouchableOpacity
          className="flex-1"
          onPress={handleGalleryNamePress}
          eventElementId="Feed Gallery Name Button"
          eventName="Feed Gallery Name Clicked"
          eventContext={contexts.Feed}
        >
          <Typography
            className="text-sm"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {galleryName || 'their gallery'}
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

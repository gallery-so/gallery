import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListSectionHeaderFragment$key } from '~/generated/FeedListSectionHeaderFragment.graphql';
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
              name
            }
          }
        }
      }
    `,
    feedEventRef
  );

  if (feedEvent.eventData?.__typename === 'GalleryUpdatedFeedEventData') {
    return (
      <View className="flex flex-row items-center justify-between bg-white dark:bg-black px-3 py-2">
        <View className="flex flex-row space-x-1">
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {feedEvent.eventData.owner?.username}
          </Typography>

          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            updated
          </Typography>

          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {feedEvent.eventData.gallery?.name || 'Untitled'}
          </Typography>
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

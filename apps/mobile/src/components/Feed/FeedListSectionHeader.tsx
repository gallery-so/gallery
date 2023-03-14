import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListSectionHeaderFragment$key } from '~/generated/FeedListSectionHeaderFragment.graphql';

import { Typography } from '../Typography';

type FeedListSectionHeaderProps = {
  feedEventRef: FeedListSectionHeaderFragment$key;
};

export function FeedListSectionHeader({ feedEventRef }: FeedListSectionHeaderProps) {
  const feedEvent = useFragment(
    graphql`
      fragment FeedListSectionHeaderFragment on FeedEvent {
        __typename

        eventData {
          __typename

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
      <View className="flex flex-row space-x-1 bg-white px-3 py-2">
        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {feedEvent.eventData.owner?.username}
        </Typography>

        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          /
        </Typography>

        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {feedEvent.eventData.gallery?.name || 'Untitled'}
        </Typography>
      </View>
    );
  }

  return null;
}

import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListSectionHeaderFragment$key } from '~/generated/FeedListSectionHeaderFragment.graphql';

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
        <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>
          {feedEvent.eventData.owner?.username}
        </Text>

        <Text style={{ fontFamily: 'ABCDiatypeRegular', fontSize: 12 }}>/</Text>

        <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>
          {feedEvent.eventData.gallery?.name}
        </Text>
      </View>
    );
  }

  return null;
}

import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListCaptionFragment$key } from '~/generated/FeedListCaptionFragment.graphql';

import { Typography } from '../Typography';

type FeedListCaptionProps = {
  feedEventRef: FeedListCaptionFragment$key;
};

export function FeedListCaption({ feedEventRef }: FeedListCaptionProps) {
  const feedEvent = useFragment(
    graphql`
      fragment FeedListCaptionFragment on FeedEvent {
        caption
      }
    `,
    feedEventRef
  );

  if (!feedEvent.caption) {
    return null;
  }

  return (
    <View className="ml-[12px] h-[28px] border-porcelain dark:border-shadow border-l-2 mb-1">
      <Typography
        className="px-2 text-base tracking-tight"
        font={{ family: 'GTAlpina', weight: 'Light', italic: true }}
        numberOfLines={1}
      >
        {feedEvent.caption}
      </Typography>
    </View>
  );
}

import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CaptionListItemFragment$key } from '~/generated/CaptionListItemFragment.graphql';

import { Markdown } from '../Markdown';

type CaptionListItemProps = {
  feedEventRef: CaptionListItemFragment$key;
};

export function CaptionListItem({ feedEventRef }: CaptionListItemProps) {
  const feedEvent = useFragment(
    graphql`
      fragment CaptionListItemFragment on FeedEvent {
        caption
      }
    `,
    feedEventRef
  );

  if (!feedEvent.caption) {
    return null;
  }

  return (
    <View className="flex flex-row space-x-2 px-3">
      <View className="bg-porcelain h-full w-[2]" />

      <Markdown>{feedEvent.caption}</Markdown>
    </View>
  );
}

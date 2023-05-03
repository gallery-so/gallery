import { View } from 'react-native';

import { Markdown } from '../Markdown';

type Props = {
  collectorsNote: string;
};

export function FeedListCollectorsNote({ collectorsNote }: Props) {
  return (
    <View className="flex flex-row space-x-2 px-3 pt-3 pb-4">
      <View className="bg-porcelain h-full w-0.5" />
      <View>
        <Markdown numberOfLines={2}>{collectorsNote}</Markdown>
      </View>
    </View>
  );
}

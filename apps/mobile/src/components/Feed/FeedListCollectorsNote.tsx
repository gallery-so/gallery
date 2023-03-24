import { View } from 'react-native';

import { Markdown } from '../Markdown';

type Props = {
  collectorsNote: string;
};

export function FeedListCollectorsNote({ collectorsNote }: Props) {
  return (
    <View className="flex flex-row space-x-2 px-3 py-2">
      <View className="bg-porcelain h-full w-0.5" />
      <View>
        <Markdown>{collectorsNote}</Markdown>
      </View>
    </View>
  );
}

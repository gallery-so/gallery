import { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function FeedEventCarouselCellHeader({ children }: PropsWithChildren) {
  return <View className="flex flex-row space-x-1 px-3 py-2">{children}</View>;
}

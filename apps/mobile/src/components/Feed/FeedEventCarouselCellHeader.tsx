import { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function FeedEventCarouselCellHeader({ children }: PropsWithChildren) {
  return <View className="flex flex-row px-3 py-2 space-x-1">{children}</View>;
}

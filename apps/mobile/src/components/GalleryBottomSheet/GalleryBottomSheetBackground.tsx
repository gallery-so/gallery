import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { View } from 'react-native';

export function GalleryBottomSheetBackground(props: BottomSheetBackgroundProps) {
  return <View className="bg-white dark:bg-black-900 border border-blue" {...props}></View>;
}

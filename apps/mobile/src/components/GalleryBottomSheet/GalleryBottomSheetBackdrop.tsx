import { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useCallback } from 'react';
import { Keyboard } from 'react-native';

export function GalleryBottomSheetBackdrop({ animatedIndex, ...props }: BottomSheetBackdropProps) {
  const handlePress = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <BottomSheetBackdrop
      {...props}
      animatedIndex={animatedIndex}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0}
      onPress={handlePress}
    />
  );
}

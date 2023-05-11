import { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export function GalleryBottomSheetBackdrop({ animatedIndex, ...props }: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      animatedIndex={animatedIndex}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.1}
    />
  );
}

// eslint-disable-next-line no-restricted-imports
import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef } from 'react';

import { GalleryBottomSheetBackdrop } from '~/components/GalleryBottomSheet/GalleryBottomSheetBackdrop';
import { GalleryBottomSheetBackground } from '~/components/GalleryBottomSheet/GalleryBottomSheetBackground';
import { GalleryBottomSheetHandle } from '~/components/GalleryBottomSheet/GalleryBottomSheetHandle';

export type GalleryBottomSheetModalType = BottomSheetModal;

type GalleryBottomSheetModalProps = {
  border?: boolean;
} & Omit<BottomSheetModalProps, 'backgroundComponent' | 'backdropComponent'>;

function GalleryBottomSheetModal(
  props: GalleryBottomSheetModalProps,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const borderRadius = props.border ? 20 : 0;

  return (
    <BottomSheetModal
      ref={ref}
      backgroundStyle={{
        borderRadius,
      }}
      backgroundComponent={GalleryBottomSheetBackground}
      handleComponent={GalleryBottomSheetHandle}
      // Hack to avoid flickering backdrop when using `useBottomSheetDynamicSnapPoints`
      // issue: https://github.com/gorhom/react-native-bottom-sheet/issues/436
      containerStyle={{
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      backdropComponent={GalleryBottomSheetBackdrop}
      {...props}
    />
  );
}

const ForwardedGalleryBottomSheetModal = forwardRef<BottomSheetModal, GalleryBottomSheetModalProps>(
  GalleryBottomSheetModal
);

export { ForwardedGalleryBottomSheetModal as GalleryBottomSheetModal };

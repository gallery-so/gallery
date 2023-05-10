// eslint-disable-next-line no-restricted-imports
import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef } from 'react';

import { GalleryBottomSheetBackdrop } from '~/components/GalleryBottomSheet/GalleryBottomSheetBackdrop';
import { GalleryBottomSheetBackground } from '~/components/GalleryBottomSheet/GalleryBottomSheetBackground';
import { GalleryBottomSheetHandle } from '~/components/GalleryBottomSheet/GalleryBottomSheetHandle';

export type GalleryBottomSheetModalType = BottomSheetModal;

function GalleryBottomSheetModal(
  props: BottomSheetModalProps,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  return (
    <BottomSheetModal
      ref={ref}
      backgroundStyle={{
        borderRadius: 40,
      }}
      backgroundComponent={GalleryBottomSheetBackground}
      backdropComponent={GalleryBottomSheetBackdrop}
      handleComponent={GalleryBottomSheetHandle}
      {...props}
    />
  );
}

const ForwardedGalleryBottomSheetModal = forwardRef<BottomSheetModal, BottomSheetModalProps>(
  GalleryBottomSheetModal
);

export { ForwardedGalleryBottomSheetModal as GalleryBottomSheetModal };

import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, PropsWithChildren, useRef } from 'react';

import { GalleryBottomSheetBackdrop } from '~/components/GalleryBottomSheetBackdrop';
import { GalleryBottomSheetHandle } from '~/components/GalleryBottomSheetHandle';

type BottomSheetUserFollowListProps = PropsWithChildren<Omit<BottomSheetModalProps, 'snapPoints'>>;

function BottomSheetUserFollowList(
  { children, ...rest }: BottomSheetUserFollowListProps,
  ref: ForwardedRef<BottomSheetModal>
) {
  const localRef = useRef<BottomSheetModal | null>(null);

  return (
    <BottomSheetModal
      ref={(instance) => {
        localRef.current = instance;

        if (typeof ref === 'function') {
          ref(instance);
        } else if (ref) {
          ref.current = instance;
        }
      }}
      snapPoints={[320]}
      handleComponent={GalleryBottomSheetHandle}
      backdropComponent={GalleryBottomSheetBackdrop}
      {...rest}
    >
      {children}
    </BottomSheetModal>
  );
}

const ForwardedBottomSheetUserFollowList = forwardRef<
  BottomSheetModal,
  BottomSheetUserFollowListProps
>(BottomSheetUserFollowList);

export { ForwardedBottomSheetUserFollowList as BottomSheetUserFollowList };

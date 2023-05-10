import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { ForwardedRef, forwardRef, PropsWithChildren, useRef } from 'react';

import { BottomSheetHandle } from '~/components/BottomSheetHandle';

type BottomSheetUserFollowListProps = PropsWithChildren<Omit<BottomSheetModalProps, 'snapPoints'>>;

function BottomSheetUserFollowList(
  { children, ...rest }: BottomSheetUserFollowListProps,
  ref: ForwardedRef<BottomSheetModal>
) {
  const localRef = useRef<BottomSheetModal | null>(null);

  useFocusEffect(() => {
    return () => {
      localRef.current?.dismiss();
    };
  });

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
      handleComponent={BottomSheetHandle}
      snapPoints={[320]}
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

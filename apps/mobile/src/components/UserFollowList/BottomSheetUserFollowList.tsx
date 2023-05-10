import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, PropsWithChildren } from 'react';

type BottomSheetUserFollowListProps = PropsWithChildren<Omit<BottomSheetModalProps, 'snapPoints'>>;

function BottomSheetUserFollowList(
  { children, ...rest }: BottomSheetUserFollowListProps,
  ref: ForwardedRef<BottomSheetModal>
) {
  return (
    <BottomSheetModal ref={ref} snapPoints={[300]} {...rest}>
      {children}
    </BottomSheetModal>
  );
}

const ForwardedBottomSheetUserFollowList = forwardRef<
  BottomSheetModal,
  BottomSheetUserFollowListProps
>(BottomSheetUserFollowList);

export { ForwardedBottomSheetUserFollowList as BottomSheetUserFollowList };

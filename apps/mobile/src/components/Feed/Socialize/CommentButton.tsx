import { useColorScheme } from 'nativewind';
import { ForwardedRef, useCallback, useMemo, useRef } from 'react';
import { View, ViewProps } from 'react-native';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';

import { CommentBox } from './CommentBox';
import { CommentIcon } from './CommentIcon';

type Props = {
  style?: ViewProps['style'];
  onClick: () => void;
  onSubmit: (value: string) => void;
  isSubmittingComment: boolean;

  bottomSheetRef: ForwardedRef<GalleryBottomSheetModalType>;
};

export function CommentButton({
  style,
  onClick,
  onSubmit,
  isSubmittingComment,
  bottomSheetRef,
}: Props) {
  const { colorScheme } = useColorScheme();

  const snapPoints = useMemo(() => [52], []);
  const internalRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleCloseCommentBox = useCallback(() => {
    internalRef.current?.close();
  }, []);

  const toggleCommentBox = useCallback(() => {
    onClick();
    internalRef.current?.present();
  }, [onClick]);

  return (
    <>
      <GalleryTouchableOpacity
        onPress={toggleCommentBox}
        className="flex justify-center items-center w-[32] h-[32] pt-1 "
        style={style}
        eventElementId="Toggle Comment Box"
        eventName="Toggle Comment Box Clicked"
      >
        <CommentIcon className="h-[20]" />
      </GalleryTouchableOpacity>
      <GalleryBottomSheetModal
        index={0}
        ref={(value) => {
          internalRef.current = value;

          if (bottomSheetRef) {
            if (typeof bottomSheetRef === 'function') {
              bottomSheetRef(value);
            } else {
              bottomSheetRef.current = value;
            }
          }
        }}
        snapPoints={snapPoints}
        enableHandlePanningGesture={false}
        android_keyboardInputMode="adjustResize"
        handleComponent={Handle}
        handleIndicatorStyle={{
          display: 'none',
        }}
      >
        <View className={`${colorScheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
          <CommentBox
            autoFocus
            onClose={handleCloseCommentBox}
            onSubmit={onSubmit}
            isSubmittingComment={isSubmittingComment}
          />
        </View>
      </GalleryBottomSheetModal>
    </>
  );
}

function Handle() {
  const { colorScheme } = useColorScheme();
  return (
    <View
      className={`h-2 border-t-2 border-solid ${
        colorScheme === 'dark' ? 'bg-black border-black-500 ' : 'bg-white border-porcelain'
      }`}
    />
  );
}

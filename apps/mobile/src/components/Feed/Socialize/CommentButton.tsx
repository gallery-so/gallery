import { useColorScheme } from 'nativewind';
import { useCallback, useMemo, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { CommentButtonFragment$key } from '~/generated/CommentButtonFragment.graphql';
import { CommentButtonQueryFragment$key } from '~/generated/CommentButtonQueryFragment.graphql';

import { CommentBox } from './CommentBox';
import { CommentIcon } from './CommentIcon';

type Props = {
  eventRef: CommentButtonFragment$key;
  queryRef: CommentButtonQueryFragment$key;
  style?: ViewProps['style'];
  onClick: () => void;
};

export function CommentButton({ eventRef, queryRef, style, onClick }: Props) {
  const event = useFragment(
    graphql`
      fragment CommentButtonFragment on FeedEvent {
        ...CommentBoxFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment CommentButtonQueryFragment on Query {
        ...CommentBoxQueryFragment
      }
    `,
    queryRef
  );

  const { colorScheme } = useColorScheme();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);
  const snapPoints = useMemo(() => [52], []);

  const handleCloseCommentBox = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const toggleCommentBox = useCallback(() => {
    onClick();

    bottomSheetRef.current?.present();
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
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enableHandlePanningGesture={false}
        android_keyboardInputMode="adjustResize"
        handleComponent={Handle}
        handleIndicatorStyle={{
          display: 'none',
        }}
      >
        <View className={`${colorScheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
          <CommentBox autoFocus eventRef={event} queryRef={query} onClose={handleCloseCommentBox} />
        </View>
      </GalleryBottomSheetModal>
    </>
  );
}

function Handle() {
  const { colorScheme } = useColorScheme();
  return (
    <View
      className={`h-2 border-t ${
        colorScheme === 'dark' ? 'bg-black border-offBlack' : 'bg-white border-porcelain'
      }`}
    />
  );
}

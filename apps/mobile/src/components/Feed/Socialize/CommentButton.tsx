import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { TouchableOpacity, useColorScheme, View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

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

  const colorScheme = useColorScheme();

  const bottomSheetRef = useRef<BottomSheetModal>(null);
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
      <View className="flex flex-row space-x-4" style={style}>
        <TouchableOpacity onPress={toggleCommentBox}>
          <CommentIcon />
        </TouchableOpacity>
      </View>
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enableHandlePanningGesture={false}
        android_keyboardInputMode="adjustResize"
        backdropComponent={({ animatedIndex, ...props }) => (
          <BottomSheetBackdrop
            {...props}
            animatedIndex={animatedIndex}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.1}
          />
        )}
        handleComponent={() => (
          <View
            className={`h-2 border-t ${
              colorScheme === 'dark' ? 'bg-black border-offBlack' : 'bg-white border-porcelain'
            }`}
          />
        )}
        handleIndicatorStyle={{
          display: 'none',
        }}
      >
        <View className={`${colorScheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
          <CommentBox autoFocus eventRef={event} queryRef={query} onClose={handleCloseCommentBox} />
        </View>
      </BottomSheetModal>
    </>
  );
}

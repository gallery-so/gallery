import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
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
};

export function CommentButton({ eventRef, queryRef, style }: Props) {
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
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [52], []);

  const toggleCommentBox = useCallback(() => {
    if (isCommentBoxOpen) {
      bottomSheetRef.current?.dismiss();
      setIsCommentBoxOpen(false);
      return;
    }

    bottomSheetRef.current?.present();
    setIsCommentBoxOpen(true);
  }, [isCommentBoxOpen]);

  const handleCloseCommentBox = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    setIsCommentBoxOpen(false);
  }, []);

  return (
    <View className="flex flex-row space-x-4" style={style}>
      <TouchableOpacity onPress={toggleCommentBox}>
        <CommentIcon />
      </TouchableOpacity>

      <View>
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          handleComponent={() => (
            <View
              className={`h-2 border-t ${
                colorScheme === 'dark' ? 'bg-black border-offBlack' : 'bg-white border-porcelain'
              }`}
            />
          )}
          handleIndicatorStyle={{ display: 'none' }}
        >
          <View className={`${colorScheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
            <CommentBox
              autoFocus
              eventRef={event}
              queryRef={query}
              onClose={handleCloseCommentBox}
            />
          </View>
        </BottomSheetModal>
      </View>
    </View>
  );
}

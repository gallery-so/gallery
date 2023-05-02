import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, View, ViewProps } from 'react-native';
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

  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['15%'], []);

  const toggleCommentBox = useCallback(() => {
    if (isCommentBoxOpen) {
      bottomSheetRef.current?.dismiss();
      setIsCommentBoxOpen(false);
      return;
    }

    bottomSheetRef.current?.present();
    setIsCommentBoxOpen(true);
  }, [isCommentBoxOpen]);

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
          handleComponent={() => null}
        >
          <CommentBox autoFocus eventRef={event} queryRef={query} onClose={toggleCommentBox} />
        </BottomSheetModal>
      </View>
    </View>
  );
}

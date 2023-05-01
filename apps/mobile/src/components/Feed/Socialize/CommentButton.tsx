import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
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

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['15%'], []);

  const handleOpenCommentBox = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <View className="flex flex-row space-x-4" style={style}>
      <TouchableOpacity onPress={handleOpenCommentBox}>
        <CommentIcon />
      </TouchableOpacity>

      <View>
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          handleComponent={() => null}
        >
          <CommentBox eventRef={event} queryRef={query} />
        </BottomSheetModal>
      </View>
    </View>
  );
}

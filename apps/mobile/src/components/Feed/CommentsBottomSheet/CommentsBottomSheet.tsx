import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { Ref } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommentsList } from '~/components/Feed/CommentsBottomSheet/CommentsList';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetFragment$key } from '~/generated/CommentsBottomSheetFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type CommentsBottomSheetProps = {
  feedEventId: string;
  bottomSheetRef: Ref<GalleryBottomSheetModalType>;
};

export function CommentsBottomSheet({ bottomSheetRef, feedEventId }: CommentsBottomSheetProps) {
  const { bottom } = useSafeAreaPadding();
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  return (
    <GalleryBottomSheetModal
      ref={bottomSheetRef}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        className="flex flex-col space-y-5"
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
      >
        <Typography className="text-sm px-4" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Comments
        </Typography>
      </View>
    </GalleryBottomSheetModal>
  );
}

type ConnectedCommentsListProps = {
  queryRef: any;
};
function ConnectedCommentsList({ queryRef }: ConnectedCommentsListProps) {}

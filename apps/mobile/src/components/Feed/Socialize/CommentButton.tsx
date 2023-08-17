import { ForwardedRef, useCallback, useRef } from 'react';
import { ViewProps } from 'react-native';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';

import { CommentsBottomSheet } from '../CommentsBottomSheet/CommentsBottomSheet';
import { FeedItemTypes } from '../createVirtualizedFeedEventItems';
import { CommentIcon } from './CommentIcon';

type Props = {
  style?: ViewProps['style'];
  onClick: () => void;
  feedId: string;
  type: FeedItemTypes;
  isSubmittingComment: boolean;

  bottomSheetRef: ForwardedRef<GalleryBottomSheetModalType>;
};

export function CommentButton({ style, onClick, type, feedId }: Props) {
  const commentsBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const toggleCommentBox = useCallback(() => {
    onClick();
    commentsBottomSheetRef.current?.present();
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
      <CommentsBottomSheet type={type} feedId={feedId} bottomSheetRef={commentsBottomSheetRef} />
    </>
  );
}

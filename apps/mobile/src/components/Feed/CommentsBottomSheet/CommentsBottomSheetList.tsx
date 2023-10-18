import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useEffect, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CommentsBottomSheetLine } from '~/components/Feed/CommentsBottomSheet/CommentsBottomSheetLine';
import { CommentsBottomSheetList$key } from '~/generated/CommentsBottomSheetList.graphql';

type CommentsListProps = {
  activeCommentId?: string;
  onLoadMore: () => void;
  commentRefs: CommentsBottomSheetList$key;
};

export function CommentsBottomSheetList({
  activeCommentId,
  commentRefs,
  onLoadMore,
}: CommentsListProps) {
  const comments = useFragment(
    graphql`
      fragment CommentsBottomSheetList on Comment @relay(plural: true) {
        dbid
        ...CommentsBottomSheetLineFragment
      }
    `,
    commentRefs
  );

  const ref = useRef<FlashList<(typeof comments)[number]>>(null);

  useEffect(() => {
    if (activeCommentId && ref.current) {
      const index = comments.findIndex((comment) => comment.dbid === activeCommentId);
      if (index !== -1) {
        setTimeout(() => {
          if (!ref.current) {
            return;
          }
          ref.current.scrollToIndex({ index, animated: true });
        }, 200);
      }
    }
  }, [activeCommentId, comments]);

  const renderItem = useCallback<ListRenderItem<(typeof comments)[number]>>(
    ({ item: comment }) => {
      return <CommentsBottomSheetLine activeCommentId={activeCommentId} commentRef={comment} />;
    },
    [activeCommentId]
  );

  return (
    <FlashList
      ref={ref}
      onEndReached={onLoadMore}
      renderItem={renderItem}
      data={comments}
      estimatedItemSize={24}
    />
  );
}

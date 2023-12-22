import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useEffect, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';

import { OnReplyPressParams } from '~/components/Feed/CommentsBottomSheet/CommentsBottomSheetLine';
import { CommentsBottomSheetList$key } from '~/generated/CommentsBottomSheetList.graphql';
import { CommentsBottomSheetListQueryFragment$key } from '~/generated/CommentsBottomSheetListQueryFragment.graphql';

import { CommentsBottomSheetSection } from './CommentsBottomSheetSection';

type CommentsListProps = {
  activeCommentId?: string;
  onLoadMore: () => void;
  commentRefs: CommentsBottomSheetList$key;
  onReply: (params: OnReplyPressParams) => void;
  queryRef: CommentsBottomSheetListQueryFragment$key;
};

export function CommentsBottomSheetList({
  activeCommentId,
  commentRefs,
  onLoadMore,
  onReply,
  queryRef,
}: CommentsListProps) {
  const query = useFragment(
    graphql`
      fragment CommentsBottomSheetListQueryFragment on Query {
        ...CommentsBottomSheetSectionQueryFragment
      }
    `,
    queryRef
  );

  const comments = useFragment(
    graphql`
      fragment CommentsBottomSheetList on Comment @relay(plural: true) {
        dbid
        ...CommentsBottomSheetSectionFragment
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
      return (
        <CommentsBottomSheetSection
          activeCommentId={activeCommentId}
          commentRef={comment}
          queryRef={query}
          onReplyPress={onReply}
        />
      );
    },
    [activeCommentId, onReply, query]
  );

  return (
    <FlashList
      ref={ref}
      onEndReached={onLoadMore}
      renderItem={renderItem}
      data={comments}
      estimatedItemSize={24}
      extraData={activeCommentId}
    />
  );
}

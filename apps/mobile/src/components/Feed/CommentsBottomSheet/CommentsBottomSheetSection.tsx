import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import {
  GalleryTouchableOpacity,
  GalleryTouchableOpacityProps,
} from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetSectionFragment$key } from '~/generated/CommentsBottomSheetSectionFragment.graphql';
import { CommentsBottomSheetSectionQueryFragment$key } from '~/generated/CommentsBottomSheetSectionQueryFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { CommentsBottomSheetLine, OnReplyPressParams } from './CommentsBottomSheetLine';
import { REPLIES_PER_PAGE } from './constants';

type Props = {
  activeCommentId?: string;
  commentRef: CommentsBottomSheetSectionFragment$key;
  queryRef: CommentsBottomSheetSectionQueryFragment$key;
  onReplyPress: (params: OnReplyPressParams) => void;
};

export function CommentsBottomSheetSection({
  activeCommentId,
  commentRef,
  queryRef,
  onReplyPress,
}: Props) {
  const {
    data: comment,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment(
    graphql`
      fragment CommentsBottomSheetSectionFragment on Comment
      @refetchable(queryName: "CommentsBottomSheetSectionFragmentQuery") {
        __typename
        dbid
        comment
        replies(last: $replyLast, before: $replyBefore)
          @connection(key: "CommentsBottomSheetSection_replies") {
          edges {
            node {
              __typename
              dbid
              ...CommentsBottomSheetLineFragment
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            total
          }
        }
        ...CommentsBottomSheetLineFragment
      }
    `,
    commentRef
  );

  const query = useFragment(
    graphql`
      fragment CommentsBottomSheetSectionQueryFragment on Query {
        ...CommentsBottomSheetLineQueryFragment
      }
    `,
    queryRef
  );

  const replies = useMemo(() => {
    return removeNullValues(comment.replies?.edges?.map((edge) => edge?.node));
  }, [comment.replies?.edges]);

  const totalReplies = comment.replies?.pageInfo.total ?? 0;

  const totalRepliesShown = useMemo(() => {
    return totalReplies - replies.length;
  }, [replies, totalReplies]);

  const loadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(REPLIES_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  const handleViewRepliesPress = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const handleReplyPressWithTopCommentId = useCallback(
    (params: OnReplyPressParams) => {
      const payload = {
        topCommentId: comment.dbid,
        ...params,
      };

      onReplyPress(payload);
    },
    [comment.dbid, onReplyPress]
  );

  if (!comment.comment) {
    return null;
  }

  const hasReplies = replies.length > 0;

  return (
    <View className="flex space-x-2">
      <View className="space-y-1">
        <CommentsBottomSheetLine
          hasReplies={hasReplies}
          activeCommentId={activeCommentId}
          commentRef={comment}
          queryRef={query}
          onReplyPress={handleReplyPressWithTopCommentId}
          footerElement={
            <ViewRepliesButton totalReplies={totalRepliesShown} onPress={handleViewRepliesPress} />
          }
        />
      </View>

      {replies.map((reply) => (
        <CommentsBottomSheetLine
          hasReplies={hasReplies}
          key={reply.dbid}
          activeCommentId={activeCommentId}
          commentRef={reply}
          queryRef={query}
          onReplyPress={handleReplyPressWithTopCommentId}
          isReply
        />
      ))}
      <View className="pl-12">
        <ViewRepliesButton totalReplies={totalRepliesShown} onPress={handleViewRepliesPress} />
      </View>
    </View>
  );
}

type ViewRepliesButtonProps = {
  totalReplies: number;
  onPress: () => void;
  style?: GalleryTouchableOpacityProps['style'];
};

function ViewRepliesButton({ totalReplies, onPress, style }: ViewRepliesButtonProps) {
  if (totalReplies < 1) {
    return null;
  }

  return (
    <GalleryTouchableOpacity
      eventElementId={'View Replies Button'}
      eventName={'View Replies Button Press'}
      eventContext={contexts.Posts}
      onPress={onPress}
      style={style}
    >
      <View className="flex-row items-center space-x-1">
        <View className="h-1 w-1 rounded-full bg-shadow" />
        <Typography className="text-xs text-shadow" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          View {totalReplies} more
          {totalReplies === 1 ? 'reply' : 'replies'}
        </Typography>
      </View>
    </GalleryTouchableOpacity>
  );
}

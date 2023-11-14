import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay';

import {
  GalleryTouchableOpacity,
  GalleryTouchableOpacityProps,
} from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetSectionFragment$key } from '~/generated/CommentsBottomSheetSectionFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { REPLIES_PER_PAGE } from './CommentsBottomSheet';
import { CommentsBottomSheetLine, OnReplyPressParams } from './CommentsBottomSheetLine';

type Props = {
  activeCommentId?: string;
  commentRef: CommentsBottomSheetSectionFragment$key;
  onReplyPress: (params: OnReplyPressParams) => void;
};

export function CommentsBottomSheetSection({ activeCommentId, commentRef, onReplyPress }: Props) {
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

  const [showReplies, setShowReplies] = useState(false);

  const replies = useMemo(() => {
    return removeNullValues(comment.replies?.edges?.map((edge) => edge?.node));
  }, [comment.replies?.edges]);

  const totalReplies = comment.replies?.pageInfo.total ?? 0;

  const totalRepliesShown = useMemo(() => {
    if (!showReplies) {
      return totalReplies;
    }

    return totalReplies - replies.length;
  }, [replies, showReplies, totalReplies]);

  const loadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(REPLIES_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  const handleViewRepliesPress = useCallback(() => {
    if (!showReplies) {
      setShowReplies(true);
    } else {
      loadMore();
    }
  }, [loadMore, showReplies]);

  useEffect(() => {
    // if the active commentId is in a reply, we want to show the replies
    if (activeCommentId && replies.find((reply) => reply.dbid === activeCommentId)) {
      setShowReplies(true);
    }
  }, [activeCommentId, replies]);

  if (!comment.comment) {
    return null;
  }

  return (
    <View className="flex space-x-2">
      <View className="space-y-1">
        <CommentsBottomSheetLine
          activeCommentId={activeCommentId}
          commentRef={comment}
          onReplyPress={onReplyPress}
          footerElement={
            !showReplies && (
              <ViewRepliesButton
                totalReplies={totalRepliesShown}
                showReplies={showReplies}
                handleViewRepliesPress={handleViewRepliesPress}
              />
            )
          }
        />
      </View>

      {showReplies && (
        <>
          {replies.map((reply) => (
            <CommentsBottomSheetLine
              key={reply.dbid}
              activeCommentId={activeCommentId}
              commentRef={reply}
              onReplyPress={onReplyPress}
              isReply
            />
          ))}
          <View className="pl-12">
            <ViewRepliesButton
              totalReplies={totalRepliesShown}
              showReplies={showReplies}
              handleViewRepliesPress={handleViewRepliesPress}
            />
          </View>
        </>
      )}
    </View>
  );
}

type ViewRepliesButtonProps = {
  totalReplies: number;
  showReplies: boolean;
  handleViewRepliesPress: () => void;
  style?: GalleryTouchableOpacityProps['style'];
};

function ViewRepliesButton({
  totalReplies,
  showReplies,
  handleViewRepliesPress,
  style,
}: ViewRepliesButtonProps) {
  if (totalReplies < 1) {
    return null;
  }

  return (
    <GalleryTouchableOpacity
      eventElementId={'CommentsBottomSheetLine View Replies'}
      eventName={'CommentsBottomSheetLine View Replies'}
      eventContext={contexts.Posts}
      onPress={handleViewRepliesPress}
      style={style}
    >
      <View className="flex-row items-center space-x-1">
        <View className="h-1 w-1 rounded-full bg-shadow" />
        <Typography className="text-xs text-shadow" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          View {totalReplies} {showReplies ? 'more ' : ''}
          {totalReplies === 1 ? 'reply' : 'replies'}
        </Typography>
      </View>
    </GalleryTouchableOpacity>
  );
}

import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import {
  GalleryTouchableOpacity,
  GalleryTouchableOpacityProps,
} from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetSectionFragment$key } from '~/generated/CommentsBottomSheetSectionFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { CommentsBottomSheetLine, OnReplyPressParams } from './CommentsBottomSheetLine';

type Props = {
  activeCommentId?: string;
  commentRef: CommentsBottomSheetSectionFragment$key;
  onReplyPress: (params: OnReplyPressParams) => void;
};

export function CommentsBottomSheetSection({ activeCommentId, commentRef, onReplyPress }: Props) {
  const comment = useFragment(
    graphql`
      fragment CommentsBottomSheetSectionFragment on Comment {
        __typename
        dbid
        comment
        replies(last: $last, before: $before)
          @connection(key: "CommentsBottomSheetSection_replies") {
          edges {
            node {
              __typename
              dbid
              ...CommentsBottomSheetLineFragment
            }
          }
        }
        ...CommentsBottomSheetLineFragment
      }
    `,
    commentRef
  );

  const [showReplies, setShowReplies] = useState(false);

  const replies = useMemo(() => {
    return removeNullValues(comment.replies?.edges?.map((edge) => edge?.node)).reverse();
  }, [comment.replies?.edges]);

  const totalReplies = replies?.length ?? 0;

  const handleViewRepliesPress = useCallback(() => {
    setShowReplies(true);
  }, []);

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
            <ViewRepliesButton
              totalReplies={totalReplies}
              showReplies={showReplies}
              handleViewRepliesPress={handleViewRepliesPress}
            />
          }
        />
      </View>

      {showReplies && (
        <View className="pl-6">
          {replies.map((reply) => (
            <CommentsBottomSheetLine
              key={reply.dbid}
              activeCommentId={activeCommentId}
              commentRef={reply}
              onReplyPress={onReplyPress}
            />
          ))}
        </View>
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
  if (totalReplies > 0 && !showReplies) {
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
          <Typography
            className="text-xs text-shadow"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            View {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
          </Typography>
        </View>
      </GalleryTouchableOpacity>
    );
  }

  return null;
}

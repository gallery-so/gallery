import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetLineFragment$key } from '~/generated/CommentsBottomSheetLineFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { getTimeSince } from '~/shared/utils/time';

export type OnReplyPressParams = {
  username?: string;
  commentId?: string;
} | null;

type CommentLineProps = {
  activeCommentId?: string;
  commentRef: CommentsBottomSheetLineFragment$key;
  onReplyPress: (params: OnReplyPressParams) => void;
  footerElement?: React.ReactNode;
  isReply?: boolean;
};

export function CommentsBottomSheetLine({
  activeCommentId,
  commentRef,
  onReplyPress,
  footerElement,
  isReply,
}: CommentLineProps) {
  const comment = useFragment(
    graphql`
      fragment CommentsBottomSheetLineFragment on Comment {
        __typename
        dbid
        comment
        creationTime
        commenter {
          username

          ...ProfilePictureFragment
        }
        mentions {
          ...ProcessedTextFragment
        }
      }
    `,
    commentRef
  );
  const timeAgo = getTimeSince(comment.creationTime);
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleUserPress = useCallback(() => {
    const username = comment?.commenter?.username;
    if (username) {
      navigation.push('Profile', { username: username, hideBackButton: false });
    }
  }, [comment?.commenter?.username, navigation]);

  const nonNullMentions = useMemo(() => removeNullValues(comment.mentions), [comment.mentions]);

  const handleReplyPress = useCallback(() => {
    onReplyPress({
      username: comment?.commenter?.username ?? undefined,
      commentId: comment.dbid,
    });
  }, [comment?.commenter?.username, comment.dbid, onReplyPress]);

  if (!comment.comment) {
    return null;
  }

  return (
    <View
      className={clsx('flex flex-row space-x-2 px-4 py-2', {
        'bg-offWhite dark:bg-black-800': activeCommentId === comment.dbid,
        'pl-12': isReply,
      })}
    >
      {comment.commenter && (
        <View className="mt-1">
          <GalleryTouchableOpacity
            onPress={handleUserPress}
            eventElementId={'CommentsBottomSheetLine Single User'}
            eventName={'CommentsBottomSheetLine Single User'}
            eventContext={contexts.Posts}
          >
            <ProfilePicture userRef={comment.commenter} size="sm" />
          </GalleryTouchableOpacity>
        </View>
      )}
      <View className="flex flex-col grow-0">
        <View className="flex flex-row space-x-1">
          <Typography className="text-sm leading-4" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {comment.commenter?.username}
          </Typography>
          <Typography
            className="text-xxs text-metal leading-4"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {timeAgo}
          </Typography>
        </View>
        <View className="flex mr-5 space-y-1">
          <ProcessedText text={comment.comment} mentionsRef={nonNullMentions} />

          <GalleryTouchableOpacity
            eventElementId={'CommentsBottomSheetLine Reply'}
            eventName={'CommentsBottomSheetLine Reply'}
            eventContext={contexts.Posts}
            onPress={handleReplyPress}
          >
            <Typography
              className="text-xs text-shadow"
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
            >
              Reply
            </Typography>
          </GalleryTouchableOpacity>

          {footerElement}
        </View>
      </View>
    </View>
  );
}

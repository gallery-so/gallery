import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetLineFragment$key } from '~/generated/CommentsBottomSheetLineFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { getTimeSince } from '~/shared/utils/time';

import ProcessedText from '../Socialize/ProcessedText';

type CommentLineProps = {
  activeCommentId?: string;
  commentRef: CommentsBottomSheetLineFragment$key;
};

export function CommentsBottomSheetLine({ activeCommentId, commentRef }: CommentLineProps) {
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

  if (!comment.comment) {
    return null;
  }

  return (
    <GalleryTouchableOpacity
      className={clsx('flex flex-row space-x-2 px-3 py-2', {
        'bg-offWhite dark:bg-black-800': activeCommentId === comment.dbid,
      })}
      onPress={handleUserPress}
      eventElementId={'CommentsBottomSheetLine Single User'}
      eventName={'CommentsBottomSheetLine Single User'}
    >
      {comment.commenter && (
        <View className="mt-1">
          <ProfilePicture userRef={comment.commenter} size="sm" />
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
        <ProcessedText text={comment.comment} mentionsRef={nonNullMentions} />
      </View>
    </GalleryTouchableOpacity>
  );
}

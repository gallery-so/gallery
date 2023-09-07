import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetLineFragment$key } from '~/generated/CommentsBottomSheetLineFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { getTimeSince } from '~/shared/utils/time';

type CommentLineProps = {
  commentRef: CommentsBottomSheetLineFragment$key;
};

export function CommentsBottomSheetLine({ commentRef }: CommentLineProps) {
  const comment = useFragment(
    graphql`
      fragment CommentsBottomSheetLineFragment on Comment {
        __typename
        comment
        creationTime
        commenter {
          username

          ...ProfilePictureFragment
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

  return (
    <GalleryTouchableOpacity
      className="flex flex-row space-x-2 px-2"
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
        <View className="flex">
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            {comment.comment}
          </Typography>
        </View>
      </View>
    </GalleryTouchableOpacity>
  );
}

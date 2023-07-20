import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { CommentsBottomSheetLineFragment$key } from '~/generated/CommentsBottomSheetLineFragment.graphql';
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

  return (
    <View className="flex flex-row justify-between items-center px-4">
      <View>
        <View className="flex flex-row space-x-1 items-center">
          {comment.commenter && <ProfilePicture userRef={comment.commenter} size="sm" />}

          <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {comment.commenter?.username}
          </Typography>

          <Typography
            className="text-xxs text-metal"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {timeAgo}
          </Typography>
        </View>
        <View className="pl-7">
          <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            {comment.comment}
          </Typography>
        </View>
      </View>
    </View>
  );
}

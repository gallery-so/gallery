import { View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { UsernameDisplay } from '~/components/UsernameDisplay';
import { CommentLineFragment$key } from '~/generated/CommentLineFragment.graphql';

type Props = {
  commentRef: CommentLineFragment$key;
  style?: ViewProps['style'];
  onCommentPress?: () => void;
};

export function CommentLine({ commentRef, style, onCommentPress }: Props) {
  const comment = useFragment(
    graphql`
      fragment CommentLineFragment on Comment {
        comment @required(action: THROW)
        commenter @required(action: THROW) {
          ...UsernameDisplayFragment
        }
      }
    `,
    commentRef
  );

  return (
    <View className="flex flex-row space-x-1" style={style}>
      <UsernameDisplay userRef={comment.commenter} size="sm" />
      <GalleryTouchableOpacity
        onPress={onCommentPress}
        eventElementId={null}
        eventName={null}
        className="flex flex-row wrap"
      >
        <Typography className={`text-sm`} font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          {comment.comment}
        </Typography>
      </GalleryTouchableOpacity>
    </View>
  );
}

import { Text, View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { UsernameDisplay } from '~/components/UsernameDisplay';
import { CommentLineFragment$key } from '~/generated/CommentLineFragment.graphql';

import ProcessedCommentText from './ProcessedCommentText';

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
      <GalleryTouchableOpacity
        onPress={onCommentPress}
        eventElementId={null}
        eventName={null}
        className="flex flex-row wrap"
      >
        <Text numberOfLines={2}>
          <UsernameDisplay userRef={comment.commenter} size="sm" style={{ marginRight: 4 }} />{' '}
          <ProcessedCommentText comment={comment.comment} />
        </Text>
      </GalleryTouchableOpacity>
    </View>
  );
}

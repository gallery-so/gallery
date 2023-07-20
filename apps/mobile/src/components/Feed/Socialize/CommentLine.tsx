import { Text, View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { UsernameDisplay } from '~/components/UsernameDisplay';
import { CommentLineFragment$key } from '~/generated/CommentLineFragment.graphql';

type Props = {
  commentRef: CommentLineFragment$key;
  style?: ViewProps['style'];
};

export function CommentLine({ commentRef, style }: Props) {
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
    <View className="flex flex-row" style={style}>
      <Text>
        <UsernameDisplay userRef={comment.commenter} />
        <Text className="text-xs dark:text-white flex-1"> {comment.comment}</Text>
      </Text>
    </View>
  );
}

import { Text, View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { UsernameDisplay } from '~/components/UsernameDisplay';
import { CommentNoteFragment$key } from '~/generated/CommentNoteFragment.graphql';
import { getTimeSince } from '~/shared/utils/time';

type Props = {
  commentRef: CommentNoteFragment$key;
  style?: ViewProps['style'];
};

export function CommentNote({ commentRef, style }: Props) {
  const comment = useFragment(
    graphql`
      fragment CommentNoteFragment on Comment {
        __typename

        comment
        creationTime

        commenter @required(action: THROW) {
          ...UsernameDisplayFragment
        }
      }
    `,
    commentRef
  );

  return (
    <View className="flex flex-row gap-1 justify-between items-center px-4" style={style}>
      <UsernameDisplay size="sm" userRef={comment.commenter} />
      <Text className="dark:text-white flex-1">{comment.comment}</Text>
      <Typography className="text-metal text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
        {getTimeSince(comment.creationTime)}
      </Typography>
    </View>
  );
}

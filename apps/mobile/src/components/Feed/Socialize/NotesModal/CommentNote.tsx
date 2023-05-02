import { Text, View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
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

        commenter {
          username
        }
      }
    `,
    commentRef
  );

  return (
    <View className="flex flex-row justify-between items-center px-4" style={style}>
      <Text>
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-sm"
        >
          {comment.commenter?.username ?? null}
        </Typography>{' '}
        {comment.comment}
      </Text>
      <Typography className="text-metal text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
        {getTimeSince(comment.creationTime)}
      </Typography>
    </View>
  );
}

import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { CommentLineFragment$key } from '~/generated/CommentLineFragment.graphql';

type Props = {
  commentRef: CommentLineFragment$key;
};

export function CommentLine({ commentRef }: Props) {
  const comment = useFragment(
    graphql`
      fragment CommentLineFragment on Comment {
        comment @required(action: THROW)
        commenter {
          username
        }
      }
    `,
    commentRef
  );

  return (
    <View className="flex flex-row gap-1">
      <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        {comment.commenter?.username}
      </Typography>
      <Text className="text-xs dark:text-white">{comment.comment}</Text>
    </View>
  );
}

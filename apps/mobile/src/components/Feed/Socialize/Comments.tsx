import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { CommentsFragment$key } from '~/generated/CommentsFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

import { CommentLine } from './CommentLine';
import { RemainingCommentCount } from './RemainingCommentCount';

type Props = {
  commentRefs: CommentsFragment$key;
  totalComments: number;
  onCommentPress: () => void;
};

export default function Comments({ commentRefs, totalComments, onCommentPress }: Props) {
  const comments = useFragment(
    graphql`
      fragment CommentsFragment on Comment @relay(plural: true) {
        dbid
        deleted
        ...CommentLineFragment
      }
    `,
    commentRefs
  );

  const previewComments = useMemo(() => {
    const nonDeletedComments = comments.filter((comment) => !comment.deleted);
    return nonDeletedComments.slice(-1);
  }, [comments]);

  return (
    <View className="flex flex-col space-y-1">
      {previewComments.map((comment) => {
        return (
          <CommentLine key={comment.dbid} commentRef={comment} onCommentPress={onCommentPress} />
        );
      })}

      {totalComments > 1 && previewComments.length > 0 && (
        <RemainingCommentCount totalCount={totalComments} onPress={onCommentPress} />
      )}
      {(totalComments === 0 || previewComments.length === 0) && (
        <GalleryTouchableOpacity
          onPress={onCommentPress}
          eventElementId="Add Comment Button"
          eventName="Add Comment"
          eventContext={contexts.Posts}
        >
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-sm text-shadow"
          >
            Add a comment
          </Typography>
        </GalleryTouchableOpacity>
      )}
    </View>
  );
}

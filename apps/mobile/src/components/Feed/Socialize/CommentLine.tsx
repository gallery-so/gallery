import { useMemo } from 'react';
import { Text, View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { UsernameDisplay } from '~/components/UsernameDisplay';
import { CommentLineFragment$key } from '~/generated/CommentLineFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

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
        mentions {
          ...ProcessedTextFragment
        }
      }
    `,
    commentRef
  );

  const nonNullMentions = useMemo(() => removeNullValues(comment.mentions), [comment.mentions]);

  return (
    <View className="flex flex-row space-x-1" style={style}>
      <GalleryTouchableOpacity
        onPress={onCommentPress}
        eventElementId="Comment Line"
        eventName="Comment Line Press"
        eventContext={contexts.Posts}
        className="flex flex-row wrap"
      >
        <Text numberOfLines={2}>
          <UsernameDisplay
            userRef={comment.commenter}
            size="sm"
            style={{ marginRight: 4 }}
            eventContext={contexts.Posts}
          />{' '}
          <ProcessedText text={comment.comment} mentionsRef={nonNullMentions} />
        </Text>
      </GalleryTouchableOpacity>
    </View>
  );
}

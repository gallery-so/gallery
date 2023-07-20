import { useCallback } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { usePostComment } from 'src/hooks/usePostComment';
import { useTogglePostAdmire } from 'src/hooks/useTogglePostAdmire';

import { FeedPostSocializeSectionFragment$key } from '~/generated/FeedPostSocializeSectionFragment.graphql';
import { FeedPostSocializeSectionQueryFragment$key } from '~/generated/FeedPostSocializeSectionQueryFragment.graphql';

import { AdmireButton } from '../Socialize/AdmireButton';
import { CommentButton } from '../Socialize/CommentButton';

type Props = {
  feedPostRef: FeedPostSocializeSectionFragment$key;
  queryRef: FeedPostSocializeSectionQueryFragment$key;
  onCommentPress: () => void;
};

export function FeedPostSocializeSection({ feedPostRef, queryRef, onCommentPress }: Props) {
  const post = useFragment(
    graphql`
      fragment FeedPostSocializeSectionFragment on Post {
        dbid

        ...useTogglePostAdmireFragment
      }
    `,
    feedPostRef
  );

  const query = useFragment(
    graphql`
      fragment FeedPostSocializeSectionQueryFragment on Query {
        ...useTogglePostAdmireQueryFragment
      }
    `,
    queryRef
  );

  const { toggleAdmire, hasViewerAdmiredEvent } = useTogglePostAdmire({
    postRef: post,
    queryRef: query,
  });

  const { submitComment, isSubmittingComment } = usePostComment();

  const handleSubmit = useCallback(
    (value: string) => {
      submitComment({
        feedId: post.dbid,
        value,
      });
    },
    [post.dbid, submitComment]
  );

  return (
    <View className="flex flex-row px-3 justify-between pb-8 pt-5">
      <View className="flex-1 pr-4 pt-1">{/* <Interactions eventRef={event} /> */}</View>

      <View className="flex flex-row space-x-1">
        <AdmireButton onPress={toggleAdmire} isAdmired={hasViewerAdmiredEvent} />
        <CommentButton
          onClick={onCommentPress}
          onSubmit={handleSubmit}
          isSubmittingComment={isSubmittingComment}
        />
      </View>
    </View>
  );
}

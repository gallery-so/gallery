import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { PostCommentsModalFragment$key } from '~/generated/PostCommentsModalFragment.graphql';
import { PostCommentsModalQueryFragment$key } from '~/generated/PostCommentsModalQueryFragment.graphql';
import { MentionInput } from '~/generated/useCommentOnPostMutation.graphql';
import useCommentOnPost from '~/hooks/api/posts/useCommentOnPost';
import { useClearURLQueryParams } from '~/utils/useClearURLQueryParams';
import useOptimisticUserInfo from '~/utils/useOptimisticUserInfo';

import { OnReplyClickParams } from './CommentNote';
import { CommentsModal } from './CommentsModal';
type Props = {
  postRef: PostCommentsModalFragment$key;
  queryRef: PostCommentsModalQueryFragment$key;
  fullscreen: boolean;
  activeCommentId?: string;
  replyToComment?: OnReplyClickParams;
};
export default function PostCommentsModal({
  activeCommentId,
  postRef,
  queryRef,
  fullscreen,
  replyToComment,
}: Props) {
  const {
    data: post,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment PostCommentsModalFragment on Post
      @refetchable(queryName: "PostCommentsModalRefetchableFragment") {
        interactions(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "CommentsModal_interactions") {
          edges {
            node {
              __typename

              ... on Comment {
                ...CommentsModalFragment
              }
            }
          }
        }
        id
        dbid
      }
    `,
    postRef
  );

  const query = useFragment(
    graphql`
      fragment PostCommentsModalQueryFragment on Query {
        ...useOptimisticUserInfoFragment
        ...CommentsModalQueryFragment
      }
    `,
    queryRef
  );

  useClearURLQueryParams(['commentId', 'replyToCommentUsername', 'comment', 'topCommentId']);

  const [commentOnPost, isSubmittingComment] = useCommentOnPost();

  const nonNullInteractions = useMemo(() => {
    const interactions = [];

    for (const interaction of post.interactions?.edges ?? []) {
      if (interaction?.node && interaction.node.__typename === 'Comment') {
        interactions.push(interaction.node);
      }
    }

    return interactions.reverse();
  }, [post.interactions?.edges]);

  const info = useOptimisticUserInfo(query);

  const handleSubmitComment = useCallback(
    (comment: string, mentions: MentionInput[], replyToId?: string, topCommentId?: string) => {
      commentOnPost(post.id, post.dbid, comment, info, mentions, replyToId, topCommentId);
    },
    [commentOnPost, info, post.dbid, post.id]
  );

  return (
    <CommentsModal
      activeCommentId={activeCommentId}
      commentsRef={nonNullInteractions}
      queryRef={query}
      fullscreen={fullscreen}
      hasPrevious={hasPrevious}
      loadPrevious={loadPrevious}
      onSubmitComment={handleSubmitComment}
      isSubmittingComment={isSubmittingComment}
      replyToComment={replyToComment}
    />
  );
}

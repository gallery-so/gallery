import { useCallback } from 'react';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useDeleteCommentFragment$key } from '~/generated/useDeleteCommentFragment.graphql';
import { useDeleteCommentMutation } from '~/generated/useDeleteCommentMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type Props = {
  commentRef: useDeleteCommentFragment$key;
};

export function useDeleteComment({ commentRef }: Props) {
  const comment = useFragment(
    graphql`
      fragment useDeleteCommentFragment on Comment {
        __typename
        dbid
        source {
          __typename
          ... on FeedEvent {
            dbid
          }
          ... on Post {
            dbid
          }
        }
      }
    `,
    commentRef
  );

  const [deleteComment] = usePromisifiedMutation<useDeleteCommentMutation>(graphql`
    mutation useDeleteCommentMutation($commentId: DBID!) @raw_response_type {
      removeComment(commentId: $commentId) {
        ... on RemoveCommentPayload {
          __typename
        }
      }
    }
  `);

  const reportError = useReportError();

  let storeId = '';

  if (comment?.source?.__typename === 'Post') {
    storeId = `Post:${comment.source.dbid}`;
  } else if (comment?.source?.__typename === 'FeedEvent') {
    storeId = `FeedEvent:${comment?.source?.dbid}`;
  }

  const commentsBottomSheetConnection = ConnectionHandler.getConnectionID(
    storeId,
    'CommentsBottomSheet_comments'
  );

  const handleDelete = useCallback(async () => {
    const commentId = comment?.dbid;
    const updater: SelectorStoreUpdater<useDeleteCommentMutation['response']> = (
      store,
      response
    ) => {
      if (response.removeComment?.__typename === 'RemoveCommentPayload') {
        const comment = store.get(`Comment:${commentId}`);
        comment?.setValue(true, 'deleted');

        const communityStore = store.get(commentsBottomSheetConnection);

        if (communityStore) {
          const pageInfo = communityStore.getLinkedRecord('pageInfo');
          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) - 1, 'total');
        }
      }
    };

    try {
      const response = await deleteComment({
        updater,
        variables: {
          commentId,
        },
      });

      if (response.removeComment?.__typename !== 'RemoveCommentPayload') {
        reportError(
          `Error while delete comment, typename was ${response.removeComment?.__typename}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError('Could not delete comment for an unknown reason', {
          tags: {
            commentId: comment?.dbid,
          },
        });
      }
    }
  }, [comment?.dbid, commentsBottomSheetConnection, deleteComment, reportError]);

  return {
    deleteComment: handleDelete,
  };
}

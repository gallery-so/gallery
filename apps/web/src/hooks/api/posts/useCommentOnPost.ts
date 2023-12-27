import { useCallback } from 'react';
import { ConnectionHandler, graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import {
  MentionInput,
  useCommentOnPostMutation,
} from '~/generated/useCommentOnPostMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import { OptimisticUserInfo } from '~/utils/useOptimisticUserInfo';

export default function useCommentOnPost() {
  const [submitComment, isSubmittingComment] =
    usePromisifiedMutation<useCommentOnPostMutation>(graphql`
      mutation useCommentOnPostMutation(
        $postId: DBID!
        $comment: String!
        $mentions: [MentionInput!]
        $connections: [ID!]!
        $replyToID: DBID
      ) @raw_response_type {
        commentOnPost(
          comment: $comment
          postId: $postId
          mentions: $mentions
          replyToID: $replyToID
        ) {
          ... on CommentOnPostPayload {
            __typename

            comment @appendNode(connections: $connections, edgeTypeName: "PostCommentEdge") {
              dbid
              ...CommentLineFragment
              ...CommentNoteFragment
            }
            replyToComment {
              __typename
              dbid
            }

            post {
              totalComments
            }
          }
        }
      }
    `);

  const { pushToast } = useToastActions();
  const reportError = useReportError();
  const pushErrorToast = useCallback(() => {
    pushToast({
      autoClose: true,
      message: "Something went wrong while posting your comment. We're looking into it.",
    });
  }, [pushToast]);

  const commentOnPost = useCallback(
    async (
      postId: string,
      postDbid: string,
      comment: string,
      optimisticUserInfo: OptimisticUserInfo,
      mentions: MentionInput[] = [],
      replyToID?: string,
      topCommentId?: string
    ) => {
      try {
        const interactionsConnection = ConnectionHandler.getConnectionID(
          postId,
          'Interactions_comments'
        );
        const commentsModalConnection = ConnectionHandler.getConnectionID(
          postId,
          'CommentsModal_interactions'
        );

        const repliesConnection = ConnectionHandler.getConnectionID(
          `Comment:${topCommentId}`,
          'CommentNoteSectionPagination_replies'
        );

        const connectionsIdsIncluded = [];

        if (topCommentId) {
          connectionsIdsIncluded.push(repliesConnection);
        } else {
          connectionsIdsIncluded.push(interactionsConnection, commentsModalConnection);
        }

        const updater: SelectorStoreUpdater<useCommentOnPostMutation['response']> = (
          store,
          response
        ) => {
          if (response.commentOnPost?.__typename === 'CommentOnPostPayload') {
            const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');

            const repliesPageInfo = store.get(repliesConnection)?.getLinkedRecord('pageInfo');
            repliesPageInfo?.setValue(
              ((repliesPageInfo?.getValue('total') as number) ?? 0) + 1,
              'total'
            );
          }
        };

        const optimisticId = Math.random().toString();
        const hasProfileImage = Boolean(optimisticUserInfo.profileImageUrl);

        const tokenProfileImagePayload = hasProfileImage
          ? {
              token: {
                dbid: 'unknown',
                id: 'unknown',
                definition: {
                  id: 'unknown2',
                  media: {
                    __typename: 'ImageMedia',
                    fallbackMedia: {
                      mediaURL: optimisticUserInfo.profileImageUrl,
                    },
                    previewURLs: {
                      large: optimisticUserInfo.profileImageUrl,
                      medium: optimisticUserInfo.profileImageUrl,
                      small: optimisticUserInfo.profileImageUrl,
                    },
                  },
                },
              },
            }
          : { token: null };

        const response = await submitComment({
          updater,
          optimisticUpdater: updater,
          optimisticResponse: {
            commentOnPost: {
              __typename: 'CommentOnPostPayload',
              comment: {
                __typename: 'Comment',
                comment,
                commenter: {
                  dbid: optimisticUserInfo.dbid ?? 'unknown',
                  id: optimisticUserInfo.id ?? 'unknown',
                  username: optimisticUserInfo.username ?? null,
                  profileImage: {
                    __typename: 'TokenProfileImage',
                    ...tokenProfileImagePayload,
                  },
                },
                deleted: false,
                admires: {
                  edges: [],
                  pageInfo: {
                    endCursor: '',
                    hasNextPage: false,
                    total: 0,
                  },
                },
                source: {
                  __typename: 'Post',
                  __isNode: 'Post',
                  id: `Post:${postDbid}`,
                  dbid: postDbid,
                },
                viewerAdmire: null,
                creationTime: new Date().toISOString(),
                dbid: optimisticId,
                id: `Comment:${optimisticId}`,
                // TODO: Add mentions to optimistic response when we implement mentions on web
                mentions: [],
              },
              replyToComment: {
                __typename: 'Comment',
                dbid: topCommentId ?? 'unknown',
                id: `Comment:${topCommentId ?? 'unknown'}`,
              },
            },
          },
          variables: {
            comment,
            postId: postDbid,
            mentions,
            connections: connectionsIdsIncluded,
            replyToID,
          },
        });

        if (response.commentOnPost?.__typename !== 'CommentOnPostPayload') {
          pushErrorToast();

          reportError(
            `Error while comment on feed event, typename was ${response.commentOnPost?.__typename}`
          );
        }
      } catch (error) {
        pushErrorToast();

        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError('An unexpected error occurred while posting a comment.');
        }
        throw error;
      }
    },
    [pushErrorToast, reportError, submitComment]
  );

  return [commentOnPost, isSubmittingComment] as const;
}

import { useCallback } from 'react';
import { ConnectionHandler, graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useCommentOnFeedEventMutation } from '~/generated/useCommentOnFeedEventMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import { OptimisticUserInfo } from '~/utils/useOptimisticUserInfo';

export default function useCommentOnFeedEvent() {
  const [submitComment, isSubmittingComment] =
    usePromisifiedMutation<useCommentOnFeedEventMutation>(graphql`
      mutation useCommentOnFeedEventMutation(
        $eventId: DBID!
        $comment: String!
        $connections: [ID!]!
      ) @raw_response_type {
        commentOnFeedEvent(comment: $comment, feedEventId: $eventId) {
          ... on CommentOnFeedEventPayload {
            __typename

            comment @appendNode(connections: $connections, edgeTypeName: "FeedEventCommentEdge") {
              dbid
              ...CommentLineFragment
              ...CommentNoteFragment
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

  const commentOnFeedEvent = useCallback(
    async (
      eventId: string,
      eventDbid: string,
      comment: string,
      optimisticUserInfo: OptimisticUserInfo
    ) => {
      try {
        const interactionsConnection = ConnectionHandler.getConnectionID(
          eventId,
          'Interactions_comments'
        );
        const commentsModalConnection = ConnectionHandler.getConnectionID(
          eventId,
          'CommentsModal_interactions'
        );

        const updater: SelectorStoreUpdater<useCommentOnFeedEventMutation['response']> = (
          store,
          response
        ) => {
          if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
            const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
          }
        };

        const optimisticId = Math.random().toString();
        const hasProfileImage = Boolean(optimisticUserInfo.profileImageUrl);

        const tokenProfileImagePayload = hasProfileImage
          ? {
              token: {
                dbid: 'unknown',
                id: 'unknown',
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
            }
          : { token: null };

        const response = await submitComment({
          updater,
          optimisticUpdater: updater,
          optimisticResponse: {
            commentOnFeedEvent: {
              __typename: 'CommentOnFeedEventPayload',
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
                admires: {
                  edges: [],
                  pageInfo: {
                    endCursor: '',
                    hasNextPage: false,
                    total: 0,
                  },
                },
                source: {
                  __typename: 'FeedEvent',
                  __isNode: 'FeedEvent',
                  id: `FeedEvent:${eventDbid}`,
                  dbid: eventDbid,
                },
                viewerAdmire: null,
                creationTime: new Date().toISOString(),
                dbid: optimisticId,
                id: `Comment:${optimisticId}`,
                // TODO: Add mentions to optimistic response when we implement mentions on web
                mentions: [],
              },
            },
          },
          variables: {
            comment,
            eventId: eventDbid,
            connections: [interactionsConnection, commentsModalConnection],
          },
        });

        if (response.commentOnFeedEvent?.__typename !== 'CommentOnFeedEventPayload') {
          pushErrorToast();

          reportError(
            `Error while commenting on feed event, typename was ${response.commentOnFeedEvent?.__typename}`
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

  return [commentOnFeedEvent, isSubmittingComment] as const;
}

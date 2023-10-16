import { useCallback } from 'react';
import { ConnectionHandler, fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useEventCommentMutation } from '~/generated/useEventCommentMutation.graphql';
import { useEventCommentQuery } from '~/generated/useEventCommentQuery.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import { noop } from '~/shared/utils/noop';

type submitCommentProps = {
  feedEventId: string;
  value: string;
  onSuccess?: () => void;
};

export function useEventComment() {
  const [submitComment, isSubmittingComment] =
    usePromisifiedMutation<useEventCommentMutation>(graphql`
      mutation useEventCommentMutation($eventId: DBID!, $comment: String!, $connections: [ID!]!)
      @raw_response_type {
        commentOnFeedEvent(comment: $comment, feedEventId: $eventId) {
          ... on CommentOnFeedEventPayload {
            __typename

            comment @appendNode(connections: $connections, edgeTypeName: "FeedEventCommentEdge") {
              dbid
              __typename
              comment
              commenter {
                dbid
                id
                username
              }
              creationTime
            }
          }
        }
      }
    `);
  const reportError = useReportError();

  const relayEnvironment = useRelayEnvironment();
  const handleSubmit = useCallback(
    async ({ feedEventId, value, onSuccess = noop }: submitCommentProps) => {
      if (value.length === 0) {
        return;
      }

      try {
        // We're using `fetchQuery` here instead of a `useFragment` in the render method
        // since we don't need our data requirements blocking the initial render of the screen.
        // We also don't have to prop drill a bunch of refs down to get what we need.
        // If the data you need is only needed in a callback, it's fine to use `fetchQuery`.
        const eventRelayId = `FeedEvent:${feedEventId}`;
        const query = await fetchQuery<useEventCommentQuery>(
          relayEnvironment,
          graphql`
            query useEventCommentQuery {
              viewer {
                ... on Viewer {
                  user {
                    id
                    dbid
                    username
                  }
                }
              }
            }
          `,
          {},
          { fetchPolicy: 'store-or-network' }
        ).toPromise();

        const interactionsConnection = ConnectionHandler.getConnectionID(
          eventRelayId,
          'Interactions_comments'
        );
        const commentsBottomSheetConnection = ConnectionHandler.getConnectionID(
          eventRelayId,
          'CommentsBottomSheet_comments'
        );

        const updater: SelectorStoreUpdater<useEventCommentMutation['response']> = (
          store,
          response
        ) => {
          if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
            const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
          }
        };

        const optimisticId = Math.random().toString();
        const response = await submitComment({
          updater,
          optimisticUpdater: updater,
          optimisticResponse: {
            commentOnFeedEvent: {
              __typename: 'CommentOnFeedEventPayload',
              comment: {
                __typename: 'Comment',
                comment: value,
                commenter: {
                  dbid: query?.viewer?.user?.dbid ?? 'unknown',
                  id: query?.viewer?.user?.id ?? 'unknown',
                  username: query?.viewer?.user?.username ?? null,
                },
                creationTime: new Date().toISOString(),
                dbid: optimisticId,
                id: `Comment:${optimisticId}`,
              },
            },
          },
          variables: {
            comment: value,
            eventId: feedEventId,
            connections: [interactionsConnection, commentsBottomSheetConnection],
          },
        });

        if (response.commentOnFeedEvent?.__typename === 'CommentOnFeedEventPayload') {
          onSuccess();
        } else {
          reportError(
            `Error while commenting on feed event, typename was ${response.commentOnFeedEvent?.__typename}`
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError('An unexpected error occurred while posting a comment.');
        }
      }
    },
    [relayEnvironment, submitComment, reportError]
  );

  return {
    submitComment: handleSubmit,
    isSubmittingComment,
  };
}

import { useCallback } from 'react';
import { ConnectionHandler, fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { MentionInput, usePostCommentMutation } from '~/generated/usePostCommentMutation.graphql';
import { usePostCommentQuery } from '~/generated/usePostCommentQuery.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type submitCommentProps = {
  feedId: string;
  value: string;
  mentions?: MentionInput[];
  onSuccess?: () => void;
};

export function usePostComment() {
  const [submitComment, isSubmittingComment] =
    usePromisifiedMutation<usePostCommentMutation>(graphql`
      mutation usePostCommentMutation(
        $postId: DBID!
        $comment: String!
        $connections: [ID!]!
        $mentions: [MentionInput!]!
      ) @raw_response_type {
        commentOnPost(comment: $comment, postId: $postId, mentions: $mentions) {
          ... on CommentOnPostPayload {
            __typename

            comment @appendNode(connections: $connections, edgeTypeName: "FeedPostCommentEdge") {
              dbid
              __typename
              comment
              commenter {
                dbid
                id
                username
              }
              mentions {
                interval {
                  start
                  length
                }
                entity {
                  ... on GalleryUser {
                    id
                    dbid
                    username
                  }
                  ... on Community {
                    id
                    dbid
                    name
                  }
                }
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
    async ({ feedId, value, onSuccess = () => {}, mentions = [] }: submitCommentProps) => {
      if (value.length === 0) {
        return;
      }

      try {
        // We're using `fetchQuery` here instead of a `useFragment` in the render method
        // since we don't need our data requirements blocking the initial render of the screen.
        // We also don't have to prop drill a bunch of refs down to get what we need.
        // If the data you need is only needed in a callback, it's fine to use `fetchQuery`.
        const eventRelayId = `Post:${feedId}`;
        const query = await fetchQuery<usePostCommentQuery>(
          relayEnvironment,
          graphql`
            query usePostCommentQuery {
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
          'Interactions_post_comments'
        );

        const commentsBottomSheetConnection = ConnectionHandler.getConnectionID(
          eventRelayId,
          'CommentsBottomSheet_comments'
        );

        const updater: SelectorStoreUpdater<usePostCommentMutation['response']> = (
          store,
          response
        ) => {
          if (response.commentOnPost?.__typename === 'CommentOnPostPayload') {
            const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
          }
        };

        const optimisticId = Math.random().toString();

        // TODO: fix this
        const optimisticResponseMentions = mentions.map((mention) => ({
          __typename: 'Mention',
          entity: {
            __isNode: mention.userId ? 'GalleryUser' : 'Community',
            __typename: mention.userId ? 'GalleryUser' : 'Community',
            dbid: mention.userId ?? mention.communityId,
            username: 'test',
            name: 'community',
            id: `GalleryUser:${mention.userId ?? mention.communityId}`,
          },
          interval: {
            __typename: 'Interval',
            start: mention?.interval?.start ?? 0,
            length: mention?.interval?.length ?? 0,
          },
        }));

        const response = await submitComment({
          updater,
          optimisticUpdater: updater,
          optimisticResponse: {
            commentOnPost: {
              __typename: 'CommentOnPostPayload',
              comment: {
                __typename: 'Comment',
                comment: value,
                commenter: {
                  dbid: query?.viewer?.user?.dbid ?? 'unknown',
                  id: query?.viewer?.user?.id ?? 'unknown',
                  username: query?.viewer?.user?.username ?? null,
                },
                mentions: optimisticResponseMentions,
                creationTime: new Date().toISOString(),
                dbid: optimisticId,
                id: `Comment:${optimisticId}`,
              },
            },
          },
          variables: {
            comment: value,
            postId: feedId,
            connections: [interactionsConnection, commentsBottomSheetConnection],
            mentions,
          },
        });

        if (response.commentOnPost?.__typename === 'CommentOnPostPayload') {
          onSuccess();
        } else {
          reportError(
            `Error while commenting on post, typename was ${response.commentOnPost?.__typename}`
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

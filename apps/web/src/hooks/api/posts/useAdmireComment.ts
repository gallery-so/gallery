import { useCallback } from 'react';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useAdmireCommentFragment$key } from '~/generated/useAdmireCommentFragment.graphql';
import { useAdmireCommentMutation } from '~/generated/useAdmireCommentMutation.graphql';
import { useAdmireCommentQueryFragment$key } from '~/generated/useAdmireCommentQueryFragment.graphql';
import { useAdmireCommentRemoveMutation } from '~/generated/useAdmireCommentRemoveMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type Props = {
  commentRef: useAdmireCommentFragment$key;
  queryRef: useAdmireCommentQueryFragment$key;
};

export default function useAdmireComment({ commentRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment useAdmireCommentQueryFragment on Query {
        viewer {
          __typename
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
    queryRef
  );

  const comment = useFragment(
    graphql`
      fragment useAdmireCommentFragment on Comment {
        id
        dbid
        viewerAdmire {
          __typename
          dbid
        }
        source {
          __typename
          ... on Post {
            dbid
          }
          ... on FeedEvent {
            dbid
          }
        }
        admires(first: 1) @connection(key: "Interactions_comment_admires") {
          pageInfo {
            total
          }
          # Relay requires that we grab the edges field if we use the connection directive
          # We're selecting __typename since that shouldn't have a cost
          # eslint-disable-next-line relay/unused-fields
          edges {
            __typename
          }
        }
      }
    `,
    commentRef
  );

  const [admireComment, isAdmiringComment] =
    usePromisifiedMutation<useAdmireCommentMutation>(graphql`
      mutation useAdmireCommentMutation($commentId: DBID!, $connections: [ID!]!)
      @raw_response_type {
        admireComment(commentId: $commentId) {
          ... on AdmireCommentPayload {
            __typename
            comment {
              id
              dbid
              viewerAdmire
                @appendNode(connections: $connections, edgeTypeName: "CommentAdmireEdge") {
                __typename
                id
                dbid
                creationTime
                admirer {
                  id
                  dbid
                  username
                }
              }
            }
          }
        }
      }
    `);

  const hasViewerAdmiredComment = Boolean(comment.viewerAdmire);

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const handleAdmire = useCallback(
    async (commentId: string) => {
      if (query.viewer?.__typename !== 'Viewer') {
        return;
      }
      const interactionsConnection = ConnectionHandler.getConnectionID(
        `Comment:${commentId}`,
        'Interactions_comment_admires'
      );

      const errorMetadata: AdditionalContext['tags'] = {
        commentId: commentId,
      };

      function pushErrorToast() {
        pushToast({
          autoClose: true,
          message: `Something went wrong while admiring this comment. We're actively looking into it.`,
        });
      }

      const updater: SelectorStoreUpdater<useAdmireCommentMutation['response']> = (
        store,
        response
      ) => {
        if (response?.admireComment?.__typename === 'AdmireCommentPayload') {
          const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
        }
      };

      const optimisticId = Math.random().toString();

      try {
        const response = await admireComment({
          updater,
          optimisticUpdater: updater,
          optimisticResponse: {
            admireComment: {
              __typename: 'AdmireCommentPayload',
              comment: {
                id: commentId,
                dbid: commentId,
                viewerAdmire: {
                  __typename: 'Admire',
                  id: `Admire:${optimisticId}`,
                  dbid: optimisticId,
                  creationTime: new Date().toISOString(),
                  admirer: {
                    id: query.viewer?.user?.id ?? 'unknown',
                    dbid: query.viewer?.user?.dbid ?? 'unknown',
                    username: query.viewer?.user?.username ?? null,
                  },
                },
              },
            },
          },
          variables: {
            commentId,
            connections: [interactionsConnection],
          },
        });

        if (response.admireComment?.__typename !== 'AdmireCommentPayload') {
          pushErrorToast();

          reportError(
            `Could not admire comment, typename was ${response.admireComment?.__typename}`,
            {
              tags: errorMetadata,
            }
          );
        }
      } catch (error) {
        pushErrorToast();

        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError(`Could not admire token for an unknown reason`, {
            tags: errorMetadata,
          });
        }
      }
    },
    [admireComment, pushToast, reportError, query.viewer]
  );

  const [removeAdmire] = usePromisifiedMutation<useAdmireCommentRemoveMutation>(graphql`
    mutation useAdmireCommentRemoveMutation($admireId: DBID!) @raw_response_type {
      removeAdmire(admireId: $admireId) {
        ... on RemoveAdmirePayload {
          __typename
          admireID
        }
        ... on ErrAdmireNotFound {
          __typename
        }
      }
    }
  `);

  const handleRemoveAdmire = useCallback(async () => {
    if (!comment.viewerAdmire?.dbid) {
      return;
    }

    const interactionsConnection = ConnectionHandler.getConnectionID(
      comment.id,
      'Interactions_comment_admires'
    );

    let errorMetadata: AdditionalContext['tags'] = {};

    if (comment?.source?.__typename === 'Post') {
      errorMetadata = {
        postId: comment.source.dbid,
      };
    } else if (comment?.source?.__typename === 'FeedEvent') {
      errorMetadata = {
        feedEventId: comment.source.dbid,
      };
    }

    const updater: SelectorStoreUpdater<useAdmireCommentRemoveMutation['response']> = (
      store,
      response
    ) => {
      if (response?.removeAdmire?.__typename === 'RemoveAdmirePayload') {
        const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');
        pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) - 1, 'total');

        if (response.removeAdmire.admireID) {
          const relayId = `Admire:${response.removeAdmire.admireID}`;

          store.delete(relayId);
        }
      }
    };

    try {
      const response = await removeAdmire({
        updater,
        optimisticUpdater: updater,
        optimisticResponse: {
          removeAdmire: {
            __typename: 'RemoveAdmirePayload',
            admireID: comment.viewerAdmire.dbid,
          },
        },
        variables: {
          admireId: comment.viewerAdmire.dbid,
        },
      });
      if (
        response.removeAdmire?.__typename !== 'RemoveAdmirePayload' &&
        // We can silently fail if the comment was already not admired
        response.removeAdmire?.__typename !== 'ErrAdmireNotFound'
      ) {
        reportError(
          `Could not unadmire comment, typename was ${response.removeAdmire?.__typename}`,
          {
            tags: errorMetadata,
          }
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError(`Could not remove admire on comment for an unknown reason`, {
          tags: errorMetadata,
        });
      }
    }
  }, [comment.id, comment.source, comment?.viewerAdmire?.dbid, removeAdmire, reportError]);

  const toggleAdmireComment = useCallback(() => {
    if (hasViewerAdmiredComment) {
      handleRemoveAdmire();
    } else {
      handleAdmire(comment.dbid);
    }
  }, [comment.dbid, handleAdmire, handleRemoveAdmire, hasViewerAdmiredComment]);

  const totalAdmires = comment?.admires?.pageInfo?.total ?? 0;

  return {
    isAdmiringComment,
    toggleAdmireComment,
    totalAdmires,
    hasViewerAdmiredComment,
  };
}

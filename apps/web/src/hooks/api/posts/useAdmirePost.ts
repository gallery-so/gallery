import { useCallback } from 'react';
import { ConnectionHandler, graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useAdmirePostMutation } from '~/generated/useAdmirePostMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useAdmirePost() {
  const [admire] = usePromisifiedMutation<useAdmirePostMutation>(graphql`
    mutation useAdmirePostMutation($postId: DBID!, $connections: [ID!]!) @raw_response_type {
      admirePost(postId: $postId) {
        ... on AdmirePostPayload {
          __typename
          post {
            viewerAdmire @appendNode(edgeTypeName: "PostAdmireEdge", connections: $connections) {
              dbid
              ...AdmireNoteFragment
            }
          }
        }
        # // todo add to graphql schema
        # ... on ErrAdmireAlreadyExists {
        #   __typename
        # }
      }
    }
  `);

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const admirePost = useCallback(
    async (postId: string, postDbid: string) => {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        postId,
        'Interactions_admires'
      );
      const admireModalConnection = ConnectionHandler.getConnectionID(
        postId,
        'AdmiresModal_interactions'
      );

      const errorMetadata: AdditionalContext['tags'] = {
        postId: postDbid,
      };

      function pushErrorToast() {
        pushToast({
          autoClose: true,
          message: `Something went wrong while admiring this post. We're actively looking into it.`,
        });
      }

      const updater: SelectorStoreUpdater<useAdmirePostMutation['response']> = (
        store,
        response
      ) => {
        if (response?.admirePost?.__typename === 'AdmirePostPayload') {
          // update store
          const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
        }
      };

      try {
        const response = await admire({
          updater,
          optimisticUpdater: updater,
          variables: {
            postId: postDbid,
            connections: [interactionsConnection, admireModalConnection],
          },
        });

        if (
          response.admirePost?.__typename !== 'AdmirePostPayload'

          // todo add to graphql schema

          // && response.admirePost?.__typename !== 'ErrAdmireAlreadyExists'
        ) {
          pushErrorToast();

          reportError(`Could not admire post, typename was ${response.admirePost?.__typename}`, {
            tags: errorMetadata,
          });
        }
      } catch (error) {
        pushErrorToast();

        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError(`Could not admire post for an unknown reason`, {
            tags: errorMetadata,
          });
        }
      }
    },
    [admire, pushToast, reportError]
  );

  return [admirePost] as const;
}

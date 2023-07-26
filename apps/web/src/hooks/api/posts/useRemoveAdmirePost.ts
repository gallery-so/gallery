import { useCallback } from 'react';
import { ConnectionHandler, graphql, SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useRemoveAdmirePostMutation } from '~/generated/useRemoveAdmirePostMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useRemoveAdmirePost() {
  const [removeAdmire] = usePromisifiedMutation<useRemoveAdmirePostMutation>(graphql`
    mutation useRemoveAdmirePostMutation($admireId: DBID!) @raw_response_type {
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

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const removeAdmirePost = useCallback(
    async (postId: string, postDbid: string, removedAdmireDbid: string) => {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        postId,
        'Interactions_previewAdmires'
      );
      const errorMetadata: AdditionalContext['tags'] = {
        postId: postDbid,
      };

      function pushErrorToast() {
        pushToast({
          autoClose: true,
          message: `Something went wrong while unadmiring this post. We're actively looking into it.`,
        });
      }

      const updater: SelectorStoreUpdater<useRemoveAdmirePostMutation['response']> = (
        store,
        response
      ) => {
        if (response?.removeAdmire?.__typename === 'RemoveAdmirePayload') {
          const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');
          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) - 1, 'total');

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
              admireID: removedAdmireDbid,
            },
          },
          variables: {
            admireId: removedAdmireDbid,
          },
        });

        if (
          response.removeAdmire?.__typename !== 'RemoveAdmirePayload' &&
          // We can silently fail if the post was already not admired
          response.removeAdmire?.__typename !== 'ErrAdmireNotFound'
        ) {
          pushErrorToast();

          reportError(
            `Could not unadmire post, typename was ${response.removeAdmire?.__typename}`,
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
          reportError(`Could not remove admire on post for an unknown reason`, {
            tags: errorMetadata,
          });
        }
      }
    },
    [pushToast, removeAdmire, reportError]
  );

  return [removeAdmirePost] as const;
}

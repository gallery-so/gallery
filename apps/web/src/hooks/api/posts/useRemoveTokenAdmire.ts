import { useCallback } from 'react';
import { ConnectionHandler, graphql, SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useRemoveTokenAdmireMutation } from '~/generated/useRemoveTokenAdmireMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useRemoveTokenAdmire() {
  const [removeAdmire] = usePromisifiedMutation<useRemoveTokenAdmireMutation>(graphql`
    mutation useRemoveTokenAdmireMutation($admireId: DBID!) @raw_response_type {
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

  const removeTokenAdmire = useCallback(
    async (tokenId: string, tokenDbid: string, removedAdmireDbid: string, viewerDbid: string) => {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        tokenId,
        'Interactions_previewAdmires'
      );
      const errorMetadata: AdditionalContext['tags'] = {
        tokenId: tokenDbid,
      };

      function pushErrorToast() {
        pushToast({
          autoClose: true,
          message: `Something went wrong while unadmiring this token. We're actively looking into it.`,
        });
      }

      const updater: SelectorStoreUpdater<useRemoveTokenAdmireMutation['response']> = (
        store,
        response
      ) => {
        if (response?.removeAdmire?.__typename === 'RemoveAdmirePayload') {
          // Update the total count of admires in the interactions list
          const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');
          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) - 1, 'total');

          if (response.removeAdmire.admireID) {
            const relayId = `Admire:${response.removeAdmire.admireID}`;

            store.delete(relayId);
          }

          // Update the total count of bookmarks in the navbar tab
          const bookmarksCountConnectionID = ConnectionHandler.getConnectionID(
            `GalleryUser:${viewerDbid}`,
            'GalleryNavLinksFragment_bookmarksCount'
          );
          const bookmarksCountStore = store.get(bookmarksCountConnectionID);
          if (bookmarksCountStore) {
            const pageInfo = bookmarksCountStore.getLinkedRecord('pageInfo');
            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) - 1, 'total');
          }

          // Remove the bookmarked token from the bookmarks list displayed on the Bookmarks tab (if connection exists in store)
          const bookmarkedTokensConnectionID = ConnectionHandler.getConnectionID(
            `GalleryUser:${viewerDbid}`,
            'BookmarkedTokenGridFragment_tokensBookmarked'
          );
          const bookmarkedTokensConnection = store.get(bookmarkedTokensConnectionID);
          const tokenRelayId = `Token:${tokenDbid}`;
          if (bookmarkedTokensConnection) {
            ConnectionHandler.deleteNode(bookmarkedTokensConnection, tokenRelayId);
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
          // We can silently fail if the token was already not admired
          response.removeAdmire?.__typename !== 'ErrAdmireNotFound'
        ) {
          pushErrorToast();

          reportError(
            `Could not unadmire token, typename was ${response.removeAdmire?.__typename}`,
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
          reportError(`Could not remove admire on token for an unknown reason`, {
            tags: errorMetadata,
          });
        }
      }
    },
    [pushToast, removeAdmire, reportError]
  );

  return [removeTokenAdmire] as const;
}

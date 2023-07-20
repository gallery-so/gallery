import { useCallback } from 'react';
import { trigger } from 'react-native-haptic-feedback';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToggleAdmireRemoveMutation } from '~/generated/useToggleAdmireRemoveMutation.graphql';
import { useTogglePostAdmireAddMutation } from '~/generated/useTogglePostAdmireAddMutation.graphql';
import { useTogglePostAdmireFragment$key } from '~/generated/useTogglePostAdmireFragment.graphql';
import { useTogglePostAdmireQueryFragment$key } from '~/generated/useTogglePostAdmireQueryFragment.graphql';
import { useTogglePostAdmireRemoveMutation } from '~/generated/useTogglePostAdmireRemoveMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type Args = {
  queryRef: useTogglePostAdmireQueryFragment$key;
  postRef: useTogglePostAdmireFragment$key;
};

export function useTogglePostAdmire({ postRef, queryRef }: Args) {
  const query = useFragment(
    graphql`
      fragment useTogglePostAdmireQueryFragment on Query {
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

  const event = useFragment(
    graphql`
      fragment useTogglePostAdmireFragment on Post {
        id
        dbid

        viewerAdmire {
          id
          dbid
        }
      }
    `,
    postRef
  );

  const reportError = useReportError();

  const [admire] = usePromisifiedMutation<useTogglePostAdmireAddMutation>(graphql`
    mutation useTogglePostAdmireAddMutation($postId: DBID!, $connections: [ID!]!)
    @raw_response_type {
      admirePost(postId: $postId) {
        ... on AdmirePostPayload {
          __typename
          post {
            viewerAdmire
              @appendNode(edgeTypeName: "FeedPostAdmireEdge", connections: $connections) {
              dbid
              __typename
              creationTime
              admirer {
                id
                dbid
                username
              }
            }

            ...useTogglePostAdmireFragment
          }
        }
      }
    }
  `);

  const [removeAdmire] = usePromisifiedMutation<useTogglePostAdmireRemoveMutation>(graphql`
    mutation useTogglePostAdmireRemoveMutation($admireId: DBID!) @raw_response_type {
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

  const interactionsConnection = ConnectionHandler.getConnectionID(
    event.id,
    'Interactions_admires'
  );
  const admireBottomSheetConnection = ConnectionHandler.getConnectionID(
    event.id,
    'AdmireBottomSheet_admires'
  );

  const handleRemoveAdmire = useCallback(async () => {
    if (!event.viewerAdmire?.dbid) {
      return;
    }

    trigger('impactLight');

    const errorMetadata: AdditionalContext['tags'] = {
      eventId: event.dbid,
    };

    const updater: SelectorStoreUpdater<useToggleAdmireRemoveMutation['response']> = (
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
            admireID: event.viewerAdmire.dbid,
          },
        },
        variables: {
          admireId: event.viewerAdmire.dbid,
        },
      });

      if (
        response.removeAdmire?.__typename !== 'RemoveAdmirePayload' &&
        // We can silently fail if the post was already not admired
        response.removeAdmire?.__typename !== 'ErrAdmireNotFound'
      ) {
        reportError(
          `Could not unadmire feed event, typename was ${response.removeAdmire?.__typename}`,
          {
            tags: errorMetadata,
          }
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError(`Could not remove admire on feed event for an unknown reason`, {
          tags: errorMetadata,
        });
      }
    }
  }, [event.dbid, event.viewerAdmire?.dbid, interactionsConnection, removeAdmire, reportError]);

  const handleAdmire = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      return;
    }

    trigger('impactLight');

    const errorMetadata: AdditionalContext['tags'] = {
      eventId: event.dbid,
    };

    const updater: SelectorStoreUpdater<useTogglePostAdmireAddMutation['response']> = (
      store,
      response
    ) => {
      if (response?.admirePost?.__typename === 'AdmirePostPayload') {
        const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

        pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
      }
    };

    try {
      const optimisticAdmireId = Math.random().toString();
      const response = await admire({
        updater,
        optimisticUpdater: updater,
        optimisticResponse: {
          admirePost: {
            __typename: 'AdmirePostPayload',
            post: {
              id: event.id,
              dbid: event.dbid,
              viewerAdmire: {
                __typename: 'Admire',
                id: `Admire:${optimisticAdmireId}`,
                dbid: optimisticAdmireId,
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
          postId: event.dbid,
          connections: [interactionsConnection, admireBottomSheetConnection],
        },
      });

      if (response.admirePost?.__typename !== 'AdmirePostPayload') {
        reportError(
          `Could not admire feed event, typename was ${response.admirePost?.__typename}`,
          {
            tags: errorMetadata,
          }
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError(`Could not post comment on feed event for an unknown reason`, {
          tags: errorMetadata,
        });
      }
    }
  }, [
    admire,
    admireBottomSheetConnection,
    event.dbid,
    event.id,
    interactionsConnection,
    query.viewer,
    reportError,
  ]);

  const hasViewerAdmiredEvent = Boolean(event.viewerAdmire);

  const toggleAdmire = useCallback(() => {
    if (hasViewerAdmiredEvent) {
      handleRemoveAdmire();
    } else {
      handleAdmire();
    }
  }, [handleAdmire, handleRemoveAdmire, hasViewerAdmiredEvent]);

  return { hasViewerAdmiredEvent, toggleAdmire };
}

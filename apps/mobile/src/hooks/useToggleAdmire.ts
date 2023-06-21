import { useCallback } from 'react';
import { trigger } from 'react-native-haptic-feedback';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToggleAdmireAddMutation } from '~/generated/useToggleAdmireAddMutation.graphql';
import { useToggleAdmireFragment$key } from '~/generated/useToggleAdmireFragment.graphql';
import { useToggleAdmireQueryFragment$key } from '~/generated/useToggleAdmireQueryFragment.graphql';
import { useToggleAdmireRemoveMutation } from '~/generated/useToggleAdmireRemoveMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type Args = {
  queryRef: useToggleAdmireQueryFragment$key;
  eventRef: useToggleAdmireFragment$key;
};

export function useToggleAdmire({ eventRef, queryRef }: Args) {
  const query = useFragment(
    graphql`
      fragment useToggleAdmireQueryFragment on Query {
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
      fragment useToggleAdmireFragment on FeedEvent {
        id
        dbid

        viewerAdmire {
          id
          dbid
        }
      }
    `,
    eventRef
  );

  const reportError = useReportError();

  const [admire] = usePromisifiedMutation<useToggleAdmireAddMutation>(graphql`
    mutation useToggleAdmireAddMutation($eventId: DBID!, $connections: [ID!]!) @raw_response_type {
      admireFeedEvent(feedEventId: $eventId) {
        ... on AdmireFeedEventPayload {
          __typename
          feedEvent {
            viewerAdmire
              @appendNode(edgeTypeName: "FeedEventAdmireEdge", connections: $connections) {
              dbid
              __typename
              creationTime
              admirer {
                id
                dbid
                username
              }
            }

            ...useToggleAdmireFragment
          }
        }
        ... on ErrAdmireAlreadyExists {
          __typename
        }
      }
    }
  `);

  const [removeAdmire] = usePromisifiedMutation<useToggleAdmireRemoveMutation>(graphql`
    mutation useToggleAdmireRemoveMutation($admireId: DBID!) @raw_response_type {
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
  const notesModalConnection = ConnectionHandler.getConnectionID(
    event.id,
    'NotesList_interactions'
  );

  const handleRemoveAdmire = useCallback(async () => {
    trigger('impactLight');

    if (!event.viewerAdmire?.dbid) {
      return;
    }

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

    const errorMetadata: AdditionalContext['tags'] = {
      eventId: event.dbid,
    };

    const updater: SelectorStoreUpdater<useToggleAdmireAddMutation['response']> = (
      store,
      response
    ) => {
      if (response?.admireFeedEvent?.__typename === 'AdmireFeedEventPayload') {
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
          admireFeedEvent: {
            __typename: 'AdmireFeedEventPayload',
            feedEvent: {
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
          eventId: event.dbid,
          connections: [interactionsConnection, notesModalConnection],
        },
      });

      if (
        response.admireFeedEvent?.__typename !== 'AdmireFeedEventPayload' &&
        // We can silently fail if the post was already admired
        response.admireFeedEvent?.__typename !== 'ErrAdmireAlreadyExists'
      ) {
        reportError(
          `Could not admire feed event, typename was ${response.admireFeedEvent?.__typename}`,
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
    event.dbid,
    event.id,
    interactionsConnection,
    notesModalConnection,
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

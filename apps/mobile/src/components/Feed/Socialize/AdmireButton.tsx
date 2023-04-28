import { useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { ConnectionHandler, graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { AdmireButtonFragment$key } from '~/generated/AdmireButtonFragment.graphql';
import { AdmireButtonMutation } from '~/generated/AdmireButtonMutation.graphql';
import { AdmireButtonQueryFragment$key } from '~/generated/AdmireButtonQueryFragment.graphql';
import { AdmireButtonRemoveMutation } from '~/generated/AdmireButtonRemoveMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

import { AdmireIcon } from './AdmireIcon';

type Props = {
  eventRef: AdmireButtonFragment$key;
  queryRef: AdmireButtonQueryFragment$key;
};

export function AdmireButton({ eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment AdmireButtonFragment on FeedEvent {
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

  const query = useFragment(
    graphql`
      fragment AdmireButtonQueryFragment on Query {
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

  const [admire] = usePromisifiedMutation<AdmireButtonMutation>(graphql`
    mutation AdmireButtonMutation($eventId: DBID!, $connections: [ID!]!) @raw_response_type {
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
          }
        }
        ... on ErrAdmireAlreadyExists {
          __typename
        }
      }
    }
  `);

  const [removeAdmire] = usePromisifiedMutation<AdmireButtonRemoveMutation>(graphql`
    mutation AdmireButtonRemoveMutation($admireId: DBID!) @raw_response_type {
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
    'NotesModal_interactions'
  );

  const handleRemoveAdmire = useCallback(async () => {
    if (!event.viewerAdmire?.dbid) {
      return;
    }

    const updater: SelectorStoreUpdater<AdmireButtonRemoveMutation['response']> = (
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
        // TODO: Handle this error
      }
    } catch (error) {
      // TODO: Handle this error
    }
  }, [event.viewerAdmire?.dbid, interactionsConnection, removeAdmire]);

  const handleAdmire = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      return;
    }
    const updater: SelectorStoreUpdater<AdmireButtonMutation['response']> = (store, response) => {
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
        // TODO: Handle this error
      }
    } catch (error) {
      // TODO: Handle this error
    }
  }, [admire, event.dbid, event.id, interactionsConnection, notesModalConnection, query.viewer]);

  const hasViewerAdmiredEvent = Boolean(event.viewerAdmire);

  return (
    <TouchableOpacity onPress={hasViewerAdmiredEvent ? handleRemoveAdmire : handleAdmire}>
      <AdmireIcon active={hasViewerAdmiredEvent} />
    </TouchableOpacity>
  );
}

import { useCallback } from 'react';
import { ConnectionHandler } from 'react-relay';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useAdmireFeedEventMutation } from '~/generated/useAdmireFeedEventMutation.graphql';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useAdmireFeedEvent() {
  const [admire] = usePromisifiedMutation<useAdmireFeedEventMutation>(graphql`
    mutation useAdmireFeedEventMutation($eventId: DBID!, $connections: [ID!]!) @raw_response_type {
      admireFeedEvent(feedEventId: $eventId) {
        ... on AdmireFeedEventPayload {
          __typename
          feedEvent {
            viewerAdmire
              @appendNode(edgeTypeName: "FeedEventAdmireEdge", connections: $connections) {
              dbid
              ...AdmireNoteFragment
            }
          }
        }
        ... on ErrAdmireAlreadyExists {
          __typename
        }
      }
    }
  `);

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const admireFeedEvent = useCallback(
    async (eventId: string, eventDbid: string) => {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        eventId,
        'Interactions_admires'
      );
      const admireModalConnection = ConnectionHandler.getConnectionID(
        eventId,
        'AdmiresModal_interactions'
      );

      const errorMetadata: AdditionalContext['tags'] = {
        eventId: eventDbid,
      };

      function pushErrorToast() {
        pushToast({
          autoClose: true,
          message: `Something went wrong while admiring this post. We're actively looking into it.`,
        });
      }

      const updater: SelectorStoreUpdater<useAdmireFeedEventMutation['response']> = (
        store,
        response
      ) => {
        if (response?.admireFeedEvent?.__typename === 'AdmireFeedEventPayload') {
          const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
        }
      };

      try {
        const response = await admire({
          updater,
          optimisticUpdater: updater,
          variables: {
            eventId: eventDbid,
            connections: [interactionsConnection, admireModalConnection],
          },
        });

        if (
          response.admireFeedEvent?.__typename !== 'AdmireFeedEventPayload' &&
          // We can silently fail if the post was already admired
          response.admireFeedEvent?.__typename !== 'ErrAdmireAlreadyExists'
        ) {
          pushErrorToast();

          reportError(
            `Could not admire feed event, typename was ${response.admireFeedEvent?.__typename}`,
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
          reportError(`Could not admire feed event for an unknown reason`, {
            tags: errorMetadata,
          });
        }
      }
    },
    [admire, pushToast, reportError]
  );

  return [admireFeedEvent] as const;
}

import { useFragment } from 'react-relay';
import { ConnectionHandler, graphql, SelectorStoreUpdater } from 'relay-runtime';
import { AdmireButtonFragment$key } from '__generated__/AdmireButtonFragment.graphql';
import { AuthModal } from 'hooks/useAuthModal';
import { AdditionalContext, useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { useCallback } from 'react';
import { AdmireButtonQueryFragment$key } from '../../../../__generated__/AdmireButtonQueryFragment.graphql';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useModalActions } from 'contexts/modal/ModalContext';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { AdmireButtonMutation } from '../../../../__generated__/AdmireButtonMutation.graphql';
import { AdmireIcon } from 'icons/SocializeIcons';
import { AdmireButtonRemoveMutation } from '../../../../__generated__/AdmireButtonRemoveMutation.graphql';

type AdmireButtonProps = {
  eventRef: AdmireButtonFragment$key;
  queryRef: AdmireButtonQueryFragment$key;
  onPotentialLayoutShift: () => void;
};

export function AdmireButton({ eventRef, queryRef, onPotentialLayoutShift }: AdmireButtonProps) {
  const event = useFragment(
    graphql`
      fragment AdmireButtonFragment on FeedEvent {
        id
        dbid

        hasViewerAdmiredEvent
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

        ...useAuthModalFragment
      }
    `,
    queryRef
  );

  const [admire] = usePromisifiedMutation<AdmireButtonMutation>(graphql`
    mutation AdmireButtonMutation($eventId: DBID!, $connections: [ID!]!) @raw_response_type {
      admireFeedEvent(feedEventId: $eventId) {
        ... on AdmireFeedEventPayload {
          __typename
          admire @appendNode(edgeTypeName: "FeedEventAdmireEdge", connections: $connections) {
            dbid
            ...AdmireLineFragment
            ...AdmireNoteFragment
          }
        }
      }
    }
  `);

  const [removeAdmire] = usePromisifiedMutation<AdmireButtonRemoveMutation>(graphql`
    mutation AdmireButtonRemoveMutation($eventId: DBID!) @raw_response_type {
      removeAdmire(feedEventId: $eventId) {
        ... on RemoveAdmirePayload {
          __typename
          admireID
        }
      }
    }
  `);

  const reportError = useReportError();
  const { pushToast } = useToastActions();
  const { showModal } = useModalActions();

  const interactionsConnection = ConnectionHandler.getConnectionID(
    event.id,
    'Interactions_admires'
  );
  const notesModalConnection = ConnectionHandler.getConnectionID(
    event.id,
    'NotesModal_interactions'
  );

  const handleRemoveAdmire = useCallback(async () => {
    const errorMetadata: AdditionalContext['tags'] = {
      eventId: event.dbid,
    };

    function pushErrorToast() {
      pushToast({
        autoClose: true,
        message: `Something went wrong while unadmiring this post. We're actively looking into it.`,
      });
    }

    const updater: SelectorStoreUpdater<AdmireButtonRemoveMutation['response']> = (
      store,
      response
    ) => {
      if (response?.removeAdmire?.__typename === 'RemoveAdmirePayload') {
        const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

        pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 1) - 1, 'total');

        store.get(event.id)?.setValue(false, 'hasViewerAdmiredEvent');
      }
    };

    try {
      const response = await removeAdmire({
        updater: updater,
        optimisticUpdater: updater,
        optimisticResponse: {
          removeAdmire: {
            __typename: 'RemoveAdmirePayload',
          },
        },
        variables: {
          eventId: event.dbid,
        },
      });

      if (response.removeAdmire?.__typename === 'RemoveAdmirePayload') {
        // Tell the virtualized list that some data has changed
        // therefore this cell's height might change.
        //
        // Ideally, this lives in a useEffect inside of the
        // changing data's component, but right now the virtualized
        // list is remounting the component every update, causing
        // an infinite useEffect to occur
        setTimeout(() => {
          onPotentialLayoutShift();
        }, 100);
      } else {
        pushErrorToast();

        reportError(
          `Could not unadmire feed event, typename was ${response.removeAdmire?.__typename}`,
          {
            tags: errorMetadata,
          }
        );
      }
    } catch (error) {
      console.log(error);
      pushErrorToast();

      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError(`Could not remove admire on feed event for an unknown reason`, {
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
    onPotentialLayoutShift,
    pushToast,
    query,
    reportError,
    showModal,
  ]);

  const handleAdmire = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      showModal({
        content: <AuthModal queryRef={query} />,
      });

      return;
    }

    const errorMetadata: AdditionalContext['tags'] = {
      eventId: event.dbid,
    };

    function pushErrorToast() {
      pushToast({
        autoClose: true,
        message: `Something went wrong while admiring this post. We're actively looking into it.`,
      });
    }

    const updater: SelectorStoreUpdater<AdmireButtonMutation['response']> = (store, response) => {
      if (response?.admireFeedEvent?.__typename === 'AdmireFeedEventPayload') {
        const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

        pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');

        store.get(event.id)?.setValue(true, 'hasViewerAdmiredEvent');
      }
    };

    try {
      const optimisticAdmireId = Math.random().toString();
      const response = await admire({
        optimisticUpdater: updater,
        updater: updater,
        optimisticResponse: {
          admireFeedEvent: {
            __typename: 'AdmireFeedEventPayload',
            admire: {
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
        variables: {
          eventId: event.dbid,
          connections: [interactionsConnection, notesModalConnection],
        },
      });

      if (response.admireFeedEvent?.__typename === 'AdmireFeedEventPayload') {
        // Tell the virtualized list that some data has changed
        // therefore this cell's height might change.
        //
        // Ideally, this lives in a useEffect inside of the
        // changing data's component, but right now the virtualized
        // list is remounting the component every update, causing
        // an infinite useEffect to occur
        setTimeout(() => {
          onPotentialLayoutShift();
        }, 100);
      } else {
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
    onPotentialLayoutShift,
    pushToast,
    query,
    reportError,
    showModal,
  ]);

  return (
    <AdmireIcon
      onClick={event.hasViewerAdmiredEvent ? handleRemoveAdmire : handleAdmire}
      active={event.hasViewerAdmiredEvent ?? false}
    />
  );
}

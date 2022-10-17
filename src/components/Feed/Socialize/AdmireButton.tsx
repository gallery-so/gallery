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

export function AdmireButton({ eventRef, queryRef }: AdmireButtonProps) {
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
          feedEvent {
            viewerAdmire
              @appendNode(edgeTypeName: "FeedEventAdmireEdge", connections: $connections) {
              dbid
              ...AdmireLineFragment
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
    if (!event.viewerAdmire?.dbid) {
      return;
    }

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
        pushErrorToast();

        reportError(
          `Could not unadmire feed event, typename was ${response.removeAdmire?.__typename}`,
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
        reportError(`Could not remove admire on feed event for an unknown reason`, {
          tags: errorMetadata,
        });
      }
    }
  }, [
    event.dbid,
    event.viewerAdmire?.dbid,
    interactionsConnection,
    pushToast,
    removeAdmire,
    reportError,
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
    pushToast,
    query,
    reportError,
    showModal,
  ]);

  const hasViewerAdmiredEvent = Boolean(event.viewerAdmire);

  return (
    <AdmireIcon
      onClick={hasViewerAdmiredEvent ? handleRemoveAdmire : handleAdmire}
      active={hasViewerAdmiredEvent}
    />
  );
}

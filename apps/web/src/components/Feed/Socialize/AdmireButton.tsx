import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { ConnectionHandler, graphql, SelectorStoreUpdater } from 'relay-runtime';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { AdmireButtonFragment$key } from '~/generated/AdmireButtonFragment.graphql';
import { AdmireButtonMutation } from '~/generated/AdmireButtonMutation.graphql';
import { AdmireButtonQueryFragment$key } from '~/generated/AdmireButtonQueryFragment.graphql';
import { AdmireButtonRemoveMutation } from '~/generated/AdmireButtonRemoveMutation.graphql';
import { AuthModal } from '~/hooks/useAuthModal';
import { AdmireIcon } from '~/icons/SocializeIcons';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { AdditionalContext, useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type AdmireButtonProps = {
  eventRef: AdmireButtonFragment$key;
  queryRef: AdmireButtonQueryFragment$key;
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
  const track = useTrack();

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
        headerText: 'Sign In',
      });

      return;
    }

    track('Admire Click');

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
      const response = await admire({
        updater,
        optimisticUpdater: updater,
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
    interactionsConnection,
    notesModalConnection,
    pushToast,
    query,
    reportError,
    showModal,
    track,
  ]);

  const hasViewerAdmiredEvent = Boolean(event.viewerAdmire);

  return (
    <AdmireIcon
      onClick={hasViewerAdmiredEvent ? handleRemoveAdmire : handleAdmire}
      active={hasViewerAdmiredEvent}
    />
  );
}

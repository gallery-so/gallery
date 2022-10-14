import { useFragment } from 'react-relay';
import { ConnectionHandler, graphql } from 'relay-runtime';
import { FeedEventSocializeSectionFragment$key } from '__generated__/FeedEventSocializeSectionFragment.graphql';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import { AdmireIcon, CommentIcon } from 'icons/SocializeIcons';
import styled from 'styled-components';
import { CommentBox } from 'components/Feed/Socialize/CommentBox';
import { useCallback, useRef, useState } from 'react';
import { Interactions } from 'components/Feed/Socialize/Interactions';
import { FeedEventSocializeSectionQueryFragment$key } from '../../../../__generated__/FeedEventSocializeSectionQueryFragment.graphql';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { FeedEventSocializeSectionAdmireMutation } from '../../../../__generated__/FeedEventSocializeSectionAdmireMutation.graphql';
import {
  FEED_EVENT_ROW_WIDTH_DESKTOP,
  FEED_EVENT_ROW_WIDTH_TABLET,
} from 'components/Feed/dimensions';
import breakpoints from 'components/core/breakpoints';
import { useToastActions } from 'contexts/toast/ToastContext';
import { AdditionalContext, useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { useModalActions } from 'contexts/modal/ModalContext';
import { AuthModal } from 'hooks/useAuthModal';
import colors from 'components/core/colors';

type FeedEventSocializeSectionProps = {
  onPotentialLayoutShift: () => void;
  eventRef: FeedEventSocializeSectionFragment$key;
  queryRef: FeedEventSocializeSectionQueryFragment$key;
};

export function FeedEventSocializeSection({
  eventRef,
  queryRef,
  onPotentialLayoutShift,
}: FeedEventSocializeSectionProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventSocializeSectionFragment on FeedEvent {
        id
        dbid
        hasViewerAdmiredEvent

        ...CommentBoxFragment
        ...InteractionsFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              id
              dbid
              username
            }
          }
        }

        ...InteractionsQueryFragment
        ...CommentBoxQueryFragment
        ...useAuthModalFragment
      }
    `,
    queryRef
  );

  const [admire] = usePromisifiedMutation<FeedEventSocializeSectionAdmireMutation>(graphql`
    mutation FeedEventSocializeSectionAdmireMutation($eventId: DBID!, $connections: [ID!]!)
    @raw_response_type {
      admireFeedEvent(feedEventId: $eventId) {
        ... on AdmireFeedEventPayload {
          __typename
          admire @prependNode(edgeTypeName: "FeedEventAdmireEdge", connections: $connections) {
            dbid
            ...AdmireLineFragment
            ...AdmireNoteFragment
          }
        }
      }
    }
  `);

  const reportError = useReportError();
  const { pushToast } = useToastActions();
  const { showModal } = useModalActions();

  const commentIconRef = useRef<HTMLDivElement | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleClose = useCallback(() => {
    setShowCommentBox(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (query.viewer?.__typename !== 'Viewer') {
      showModal({
        content: <AuthModal queryRef={query} />,
      });

      return;
    }

    setShowCommentBox((previous) => !previous);
  }, [query, showModal]);

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

    try {
      const interactionsConnection = ConnectionHandler.getConnectionID(
        event.id,
        'Interactions_admires'
      );
      const notesModalConnection = ConnectionHandler.getConnectionID(
        event.id,
        'NotesModal_interactions'
      );

      const optimisticAdmireId = Math.random().toString();
      const response = await admire({
        updater: (store, response) => {
          if (response.admireFeedEvent?.__typename === 'AdmireFeedEventPayload') {
            const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');

            store.get(event.id)?.setValue(true, 'hasViewerAdmiredEvent');
          }
        },
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
          `Could not post comment on feed event, typename was ${response.admireFeedEvent?.__typename}`,
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
    onPotentialLayoutShift,
    pushToast,
    query,
    reportError,
    showModal,
  ]);

  return (
    <SocializedSectionPadding>
      <SocializeSectionWrapper>
        <HStack justify="space-between" align="flex-end" gap={24}>
          <VStack shrink>
            <Interactions eventRef={event} queryRef={query} />
          </VStack>

          <HStack align="center">
            <IconWrapper>
              <AdmireIcon onClick={handleAdmire} active={event.hasViewerAdmiredEvent ?? false} />
            </IconWrapper>

            <IconWrapper>
              <CommentIcon onClick={handleToggle} ref={commentIconRef} />

              <CommentBox
                onPotentialLayoutShift={onPotentialLayoutShift}
                onClose={handleClose}
                eventRef={event}
                queryRef={query}
                active={showCommentBox}
              />
            </IconWrapper>
          </HStack>
        </HStack>
      </SocializeSectionWrapper>
    </SocializedSectionPadding>
  );
}

const SocializedSectionPadding = styled.div`
  padding: 0 16px;
`;

// Modeled after StyledEventInner
const SocializeSectionWrapper = styled.div`
  max-width: ${FEED_EVENT_ROW_WIDTH_TABLET}px;
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }

  // Center in space
  margin: 0 auto;
  padding-bottom: 16px;

  border-bottom: 1px solid ${colors.faint};
`;

const IconWrapper = styled.div`
  position: relative;
`;

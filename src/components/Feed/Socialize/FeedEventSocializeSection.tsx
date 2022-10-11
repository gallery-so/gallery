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

        ...CommentBoxFragment
        ...InteractionsFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        ...InteractionsQueryFragment
      }
    `,
    queryRef
  );

  const [admire] = usePromisifiedMutation<FeedEventSocializeSectionAdmireMutation>(graphql`
    mutation FeedEventSocializeSectionAdmireMutation($eventId: DBID!, $connections: [ID!]!) {
      admireFeedEvent(feedEventId: $eventId) {
        ... on AdmireFeedEventPayload {
          __typename
          admire @prependNode(edgeTypeName: "FeedEventAdmireEdge", connections: $connections) {
            dbid
            ...AdmireLineFragment
          }
        }
      }
    }
  `);

  const commentIconRef = useRef<HTMLDivElement | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleClose = useCallback(() => {
    setShowCommentBox(false);
  }, []);

  const handleToggle = useCallback(() => {
    setShowCommentBox((previous) => !previous);
  }, []);

  const reportError = useReportError();
  const { pushToast } = useToastActions();
  const handleAdmire = useCallback(async () => {
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

      const response = await admire({
        updater: (store, response) => {
          if (response.admireFeedEvent?.__typename === 'AdmireFeedEventPayload') {
            const pageInfo = store.get(interactionsConnection)?.getLinkedRecord('pageInfo');

            pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
          }
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
      }
    } catch (e) {}
  }, [admire, event.dbid, event.id, onPotentialLayoutShift, pushToast]);

  return (
    <SocializedSectionPadding>
      <SocializeSectionWrapper>
        <HStack justify="space-between" align="flex-start" gap={24}>
          <VStack shrink>
            <Interactions eventRef={event} queryRef={query} />
          </VStack>

          <HStack align="center">
            <IconWrapper>
              <AdmireIcon onClick={handleAdmire} />
            </IconWrapper>

            <IconWrapper>
              <CommentIcon onClick={handleToggle} ref={commentIconRef} />

              <CommentBox
                onPotentialLayoutShift={onPotentialLayoutShift}
                onClose={handleClose}
                eventRef={event}
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
`;

const IconWrapper = styled.div`
  position: relative;
`;

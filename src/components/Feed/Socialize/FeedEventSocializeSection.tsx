import { useFragment } from 'react-relay';
import { ConnectionHandler, graphql } from 'relay-runtime';
import { FeedEventSocializeSectionFragment$key } from '__generated__/FeedEventSocializeSectionFragment.graphql';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import { AdmireIcon, CommentIcon } from 'icons/SocializeIcons';
import styled from 'styled-components';
import { CommentBox } from 'components/Feed/Socialize/CommentBox';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CommentsAndAdmires } from 'components/Feed/Socialize/CommentsAndAdmires';
import { FeedEventSocializeSectionQueryFragment$key } from '../../../../__generated__/FeedEventSocializeSectionQueryFragment.graphql';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { FeedEventSocializeSectionAdmireMutation } from '../../../../__generated__/FeedEventSocializeSectionAdmireMutation.graphql';

type FeedEventSocializeSectionProps = {
  eventRef: FeedEventSocializeSectionFragment$key;
  queryRef: FeedEventSocializeSectionQueryFragment$key;
};

export function FeedEventSocializeSection({ eventRef, queryRef }: FeedEventSocializeSectionProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventSocializeSectionFragment on FeedEvent {
        id
        dbid

        ...CommentBoxFragment
        ...CommentsAndAdmiresFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        ...CommentsAndAdmiresQueryFragment
      }
    `,
    queryRef
  );

  const [admire] = usePromisifiedMutation<FeedEventSocializeSectionAdmireMutation>(graphql`
    mutation FeedEventSocializeSectionAdmireMutation($eventId: DBID!, $connections: [ID!]!) {
      admireFeedEvent(feedEventId: $eventId) {
        ... on AdmireFeedEventPayload {
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

  const handleAdmire = useCallback(async () => {
    try {
      const connectionId = ConnectionHandler.getConnectionID(
        event.id,
        'CommentsAndAdmires_admires'
      );

      const response = await admire({
        updater: (store) => {
          const pageInfo = store.get(connectionId)?.getLinkedRecord('pageInfo');

          pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
        },
        variables: {
          eventId: event.dbid,
          connections: [connectionId],
        },
      });

      console.log(response);
    } catch (e) {
      // handle error state
    }
  }, [admire, event.dbid, event.id]);

  useEffect(() => {
    const handleClick = () => {
      setShowCommentBox(false);
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <HStack justify="space-between" align="flex-start" gap={24}>
      <VStack shrink>
        <CommentsAndAdmires eventRef={event} queryRef={query} />
      </VStack>

      <HStack align="center">
        <IconWrapper>
          <AdmireIcon onClick={handleAdmire} />
        </IconWrapper>

        <IconWrapper>
          <CommentIcon onClick={handleToggle} ref={commentIconRef} />

          <CommentBox onClose={handleClose} eventRef={event} active={showCommentBox} />
        </IconWrapper>
      </HStack>
    </HStack>
  );
}

const IconWrapper = styled.div`
  position: relative;
`;

import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { AdmireButton } from '~/components/Feed/Socialize/AdmireButton';
import { CommentBoxIcon } from '~/components/Feed/Socialize/CommentBox/CommentBoxIcon';
import { Comments } from '~/components/Feed/Socialize/Comments';
import { FeedEventSocializeSectionFragment$key } from '~/generated/FeedEventSocializeSectionFragment.graphql';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';
import useAdmireFeedEvent from '~/hooks/api/feedEvents/useAdmireFeedEvent';
import useRemoveAdmireFeedEvent from '~/hooks/api/feedEvents/useRemoveAdmireFeedEvent';
import useOptimisticUserInfo from '~/utils/useOptimisticUserInfo';

import { AdmireLine } from './AdmireLine';

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
        ...AdmireButtonFragment
        ...AdmireLineFragment
        ...CommentBoxIconFragment
        ...CommentsFragment
        ...AdmireLineFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        ...useOptimisticUserInfoFragment
        ...AdmireButtonQueryFragment
        ...AdmireLineQueryFragment
        ...CommentBoxIconQueryFragment
        ...CommentsQueryFragment
      }
    `,
    queryRef
  );

  const [admireFeedEvent] = useAdmireFeedEvent();
  const [removeAdmireFeedEvent] = useRemoveAdmireFeedEvent();

  const info = useOptimisticUserInfo(query);

  const handleAdmireFeedEvent = useCallback(() => {
    admireFeedEvent(event.id, event.dbid, info);
  }, [admireFeedEvent, event.dbid, event.id, info]);

  return (
    <VStack gap={4}>
      <HStack justify="space-between" align="center" gap={24}>
        <AdmireLine eventRef={event} queryRef={query} onAdmire={handleAdmireFeedEvent} />
        <HStack align="center" gap={8}>
          <IconWrapper>
            <AdmireButton
              eventRef={event}
              queryRef={query}
              onAdmire={handleAdmireFeedEvent}
              onRemoveAdmire={removeAdmireFeedEvent}
            />
          </IconWrapper>

          <IconWrapper>
            <CommentBoxIcon eventRef={event} queryRef={query} />
          </IconWrapper>
        </HStack>
      </HStack>
      <HStack justify="space-between" align="flex-start" gap={24}>
        <VStack shrink>
          <Comments
            onPotentialLayoutShift={onPotentialLayoutShift}
            eventRef={event}
            queryRef={query}
          />
        </VStack>
      </HStack>
    </VStack>
  );
}

const IconWrapper = styled.div`
  position: relative;
`;

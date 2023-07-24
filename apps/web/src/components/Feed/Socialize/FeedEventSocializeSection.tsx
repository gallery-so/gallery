import { useMemo } from 'react';
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
import useRemovedAdmireFeedEvent from '~/hooks/api/feedEvents/useRemoveAdmireFeedEvent';

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
        ...AdmireButtonFragment
        ...AdmireLineFragment
        ...CommentBoxIconFragment
        ...CommentsFragment

        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        admires(last: 5) @connection(key: "Interactions_admires") {
          edges {
            node {
              __typename
            }
          }
        }
        ...AdmireLineFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        ...AdmireButtonQueryFragment
        ...AdmireLineQueryFragment
        ...CommentBoxIconQueryFragment
        ...CommentsQueryFragment
      }
    `,
    queryRef
  );

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const edge of event.admires?.edges ?? []) {
      if (edge?.node) {
        admires.push(edge.node);
      }
    }

    admires.reverse();

    return admires;
  }, [event.admires?.edges]);
  const [admire] = nonNullAdmires;
  const [admireFeedEvent] = useAdmireFeedEvent();
  const [removeAdmireFeedEvent] = useRemovedAdmireFeedEvent();
  return (
    <VStack gap={4}>
      <HStack justify="space-between" align="center" gap={24}>
        <div>{admire && <AdmireLine eventRef={event} queryRef={query} />}</div>
        <HStack align="center">
          <IconWrapper>
            <AdmireButton
              eventRef={event}
              queryRef={query}
              onAdmire={admireFeedEvent}
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

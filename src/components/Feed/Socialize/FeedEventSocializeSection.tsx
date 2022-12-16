import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { AdmireButton } from '~/components/Feed/Socialize/AdmireButton';
import { CommentBox } from '~/components/Feed/Socialize/CommentBox';
import { Interactions } from '~/components/Feed/Socialize/Interactions';
import { FeedEventSocializeSectionFragment$key } from '~/generated/FeedEventSocializeSectionFragment.graphql';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';

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
        ...CommentBoxFragment
        ...InteractionsFragment
        ...AdmireButtonFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        ...AdmireButtonQueryFragment
        ...InteractionsQueryFragment
        ...CommentBoxQueryFragment
      }
    `,
    queryRef
  );

  return (
    <HStack justify="space-between" align="flex-start" gap={24}>
      <VStack shrink>
        <Interactions
          onPotentialLayoutShift={onPotentialLayoutShift}
          eventRef={event}
          queryRef={query}
        />
      </VStack>

      <HStack align="center">
        <IconWrapper>
          <AdmireButton eventRef={event} queryRef={query} />
        </IconWrapper>

        <IconWrapper>
          <CommentBox eventRef={event} queryRef={query} />
        </IconWrapper>
      </HStack>
    </HStack>
  );
}

const IconWrapper = styled.div`
  position: relative;
`;

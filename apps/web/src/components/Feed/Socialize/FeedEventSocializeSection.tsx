import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { AdmireButton } from '~/components/Feed/Socialize/AdmireButton';
import { CommentBoxIcon } from '~/components/Feed/Socialize/CommentBox/CommentBoxIcon';
import { Interactions } from '~/components/Feed/Socialize/Interactions';
import { FeedEventSocializeSectionFragment$key } from '~/generated/FeedEventSocializeSectionFragment.graphql';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';

type FeedEventSocializeSectionProps = {
  eventRef: FeedEventSocializeSectionFragment$key;
  queryRef: FeedEventSocializeSectionQueryFragment$key;
};

export function FeedEventSocializeSection({ eventRef, queryRef }: FeedEventSocializeSectionProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventSocializeSectionFragment on FeedEvent {
        ...CommentBoxIconEventFragment
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
        ...CommentBoxIconQueryFragment
      }
    `,
    queryRef
  );

  return (
    <HStack justify="space-between" align="flex-start" gap={24}>
      <VStack shrink>
        <Interactions eventRef={event} queryRef={query} />
      </VStack>

      <HStack align="center">
        <IconWrapper>
          <AdmireButton eventRef={event} queryRef={query} />
        </IconWrapper>

        <IconWrapper>
          <CommentBoxIcon eventRef={event} queryRef={query} />
        </IconWrapper>
      </HStack>
    </HStack>
  );
}

const IconWrapper = styled.div`
  position: relative;
`;

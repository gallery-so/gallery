import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedEventSocializeSectionFragment$key } from '__generated__/FeedEventSocializeSectionFragment.graphql';
import { HStack } from 'components/core/Spacer/Stack';
import { CommentIcon, AdmireIcon } from 'icons/SocializeIcons';

type FeedEventSocializeSectionProps = {
  eventRef: FeedEventSocializeSectionFragment$key;
};

export function FeedEventSocializeSection({ eventRef }: FeedEventSocializeSectionProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventSocializeSectionFragment on FeedEvent {
        id
      }
    `,
    eventRef
  );

  return (
    <HStack justify="space-between">
      <div></div>
      <HStack align="center">
        <AdmireIcon />
        <CommentIcon />
      </HStack>
    </HStack>
  );
}

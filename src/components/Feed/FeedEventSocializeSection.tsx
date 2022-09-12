import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedEventSocializeSectionFragment$key } from '__generated__/FeedEventSocializeSectionFragment.graphql';

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

  return null;
}

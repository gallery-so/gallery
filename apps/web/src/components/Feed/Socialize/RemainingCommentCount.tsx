import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NoteModalOpenerText } from '~/components/Feed/Socialize/NoteModalOpenerText';
import { RemainingCommentCountFragment$key } from '~/generated/RemainingCommentCountFragment.graphql';
import { RemainingCommentCountQueryFragment$key } from '~/generated/RemainingCommentCountQueryFragment.graphql';

type RemainingAdmireCountProps = {
  eventRef: RemainingCommentCountFragment$key;
  queryRef: RemainingCommentCountQueryFragment$key;
  totalComments: number;
};

export function RemainingCommentCount({
  eventRef,
  queryRef,
  totalComments,
}: RemainingAdmireCountProps) {
  const event = useFragment(
    graphql`
      fragment RemainingCommentCountFragment on FeedEvent {
        ...NoteModalOpenerTextFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment RemainingCommentCountQueryFragment on Query {
        ...NoteModalOpenerTextQueryFragment
      }
    `,
    queryRef
  );

  if (totalComments === 0) {
    return null;
  }

  return (
    <NoteModalOpenerText eventRef={event} queryRef={query}>
      View all {totalComments} comments
    </NoteModalOpenerText>
  );
}

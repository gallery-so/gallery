import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NoteModalOpenerText } from '~/components/Feed/Socialize/NoteModalOpenerText';
import { RemainingAdmireCountFragment$key } from '~/generated/RemainingAdmireCountFragment.graphql';

type RemainingAdmireCountProps = {
  remainingCount: number;
  eventRef: RemainingAdmireCountFragment$key;
};

export function RemainingAdmireCount({ remainingCount, eventRef }: RemainingAdmireCountProps) {
  const event = useFragment(
    graphql`
      fragment RemainingAdmireCountFragment on FeedEvent {
        dbid

        ...NoteModalOpenerTextFragment
      }
    `,
    eventRef
  );

  if (remainingCount === 0) {
    return null;
  }

  return (
    <NoteModalOpenerText eventRef={event}>
      +{remainingCount} {remainingCount === 1 ? 'other' : 'others'}
    </NoteModalOpenerText>
  );
}

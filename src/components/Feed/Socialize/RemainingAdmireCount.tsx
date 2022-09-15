import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { RemainingAdmireCountFragment$key } from '__generated__/RemainingAdmireCountFragment.graphql';
import { NoteModalOpenerText } from 'components/Feed/Socialize/NoteModalOpenerText';

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

  return (
    <NoteModalOpenerText eventRef={event}>
      +{remainingCount} {remainingCount === 1 ? 'other' : 'others'}
    </NoteModalOpenerText>
  );
}

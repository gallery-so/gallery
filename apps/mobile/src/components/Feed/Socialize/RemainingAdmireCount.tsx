import { TouchableOpacity } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { RemainingAdmireCountFragment$key } from '~/generated/RemainingAdmireCountFragment.graphql';
import { RemainingAdmireCountQueryFragment$key } from '~/generated/RemainingAdmireCountQueryFragment.graphql';

import { useNotesModal } from './NotesModal/useNotesModal';

type Props = {
  remainingCount: number;
  eventRef: RemainingAdmireCountFragment$key;
  queryRef: RemainingAdmireCountQueryFragment$key;
};

export function RemainingAdmireCount({ remainingCount, eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment RemainingAdmireCountFragment on FeedEvent {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...NotesModalFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment RemainingAdmireCountQueryFragment on Query {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...NotesModalQueryFragment
      }
    `,
    queryRef
  );

  const { handleOpen, notesModal } = useNotesModal(event, query);

  if (remainingCount === 0) {
    return null;
  }

  return (
    <>
      <TouchableOpacity onPress={handleOpen}>
        <Typography className="text-xs underline" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          + {remainingCount} others
        </Typography>
      </TouchableOpacity>

      {notesModal}
    </>
  );
}

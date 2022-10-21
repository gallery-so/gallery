import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { AdmireNoteFragment$key } from '__generated__/AdmireNoteFragment.graphql';
import { BaseM } from 'components/core/Text/Text';
import { HStack } from 'components/core/Spacer/Stack';
import { getTimeSince } from 'utils/time';
import { TimeAgoText } from 'components/Feed/Socialize/NotesModal/TimeAgoText';
import { ListItem } from 'components/Feed/Socialize/NotesModal/ListItem';
import { UsernameLink } from 'components/Feed/Socialize/NotesModal/UsernameLink';
import colors from 'components/core/colors';

type AdmireNoteProps = {
  admireRef: AdmireNoteFragment$key;
};

export function AdmireNote({ admireRef }: AdmireNoteProps) {
  const admire = useFragment(
    graphql`
      fragment AdmireNoteFragment on Admire {
        __typename

        creationTime
        admirer {
          username
        }
      }
    `,
    admireRef
  );

  const timeAgo = admire.creationTime ? getTimeSince(admire.creationTime) : null;

  return (
    <ListItem justify="space-between" gap={4}>
      <HStack gap={4}>
        <UsernameLink username={admire.admirer?.username ?? null} />
        <BaseM>admired this</BaseM>
      </HStack>

      <TimeAgoText color={colors.metal}>{timeAgo}</TimeAgoText>
    </ListItem>
  );
}

import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CommentNoteFragment$key } from '__generated__/CommentNoteFragment.graphql';
import { BaseM } from 'components/core/Text/Text';
import { HStack } from 'components/core/Spacer/Stack';
import { getTimeSince } from 'utils/time';
import { TimeAgoText } from 'components/Feed/Socialize/NotesModal/TimeAgoText';
import { ListItem } from 'components/Feed/Socialize/NotesModal/ListItem';
import { UsernameLink } from 'components/Feed/Socialize/NotesModal/UsernameLink';
import colors from 'components/core/colors';

type CommentNoteProps = {
  commentRef: CommentNoteFragment$key;
};

export function CommentNote({ commentRef }: CommentNoteProps) {
  const comment = useFragment(
    graphql`
      fragment CommentNoteFragment on Comment {
        __typename

        comment
        creationTime

        commenter {
          username
        }
      }
    `,
    commentRef
  );

  const timeAgo = comment.creationTime ? getTimeSince(comment.creationTime) : null;

  return (
    <ListItem justify="space-between" gap={4}>
      <HStack gap={4}>
        <UsernameLink username={comment.commenter?.username ?? null} />
        <BaseM dangerouslySetInnerHTML={{ __html: comment.comment ?? '' }} />
      </HStack>

      <TimeAgoText color={colors.metal}>{timeAgo}</TimeAgoText>
    </ListItem>
  );
}

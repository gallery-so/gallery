import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { ListItem } from '~/components/Feed/Socialize/NotesModal/ListItem';
import { TimeAgoText } from '~/components/Feed/Socialize/NotesModal/TimeAgoText';
import { UsernameLink } from '~/components/Feed/Socialize/NotesModal/UsernameLink';
import { CommentNoteFragment$key } from '~/generated/CommentNoteFragment.graphql';
import { getTimeSince } from '~/utils/time';

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

import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { BaseM } from '~/components/core/Text/Text';
import { ListItem } from '~/components/Feed/Socialize/NotesModal/ListItem';
import { TimeAgoText } from '~/components/Feed/Socialize/NotesModal/TimeAgoText';
import { UsernameLink } from '~/components/Feed/Socialize/NotesModal/UsernameLink';
import { CommentNoteFragment$key } from '~/generated/CommentNoteFragment.graphql';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

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
    <StyledListItem justify="space-between" gap={4}>
      <p>
        <StyledUsernameContainer>
          <UsernameLink username={comment.commenter?.username ?? null} />
        </StyledUsernameContainer>
        <BaseM as="span" dangerouslySetInnerHTML={{ __html: comment.comment ?? '' }} />
      </p>

      <TimeAgoText color={colors.metal}>{timeAgo}</TimeAgoText>
    </StyledListItem>
  );
}

const StyledUsernameContainer = styled.span`
  padding-right: 4px;
`;

const StyledListItem = styled(ListItem)`
  padding: 0px 16px 16px;
`;

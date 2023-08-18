import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { ListItem } from '~/components/Feed/Socialize/CommentsModal/ListItem';
import { TimeAgoText } from '~/components/Feed/Socialize/CommentsModal/TimeAgoText';
import { UsernameLink } from '~/components/Feed/Socialize/CommentsModal/UsernameLink';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
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
          ...ProfilePictureFragment
        }
      }
    `,
    commentRef
  );

  const timeAgo = comment.creationTime ? getTimeSince(comment.creationTime) : null;

  return (
    <StyledListItem justify="space-between" gap={4}>
      <HStack gap={8}>
        {comment.commenter && (
          <StyledProfilePictureWrapper>
            <ProfilePicture size="sm" userRef={comment.commenter} />
          </StyledProfilePictureWrapper>
        )}

        <VStack>
          <HStack gap={4} align="center">
            <UsernameLink username={comment.commenter?.username ?? null} />
            <StyledTimeAgoText color={colors.metal}>{timeAgo}</StyledTimeAgoText>
          </HStack>
          <BaseM as="span" dangerouslySetInnerHTML={{ __html: comment.comment ?? '' }} />
        </VStack>
      </HStack>
    </StyledListItem>
  );
}

const StyledProfilePictureWrapper = styled.div`
  margin-top: 4px;
`;

const StyledListItem = styled(ListItem)`
  padding: 0px 16px 16px;
`;

const StyledTimeAgoText = styled(TimeAgoText)`
  font-size: 10px;
`;

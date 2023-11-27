import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { ListItem } from '~/components/Feed/Socialize/CommentsModal/ListItem';
import { TimeAgoText } from '~/components/Feed/Socialize/CommentsModal/TimeAgoText';
import { UsernameLink } from '~/components/Feed/Socialize/CommentsModal/UsernameLink';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { CommentNoteFragment$key } from '~/generated/CommentNoteFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

type CommentNoteProps = {
  commentRef: CommentNoteFragment$key;
  activeCommentId?: string;
};

export function CommentNote({ commentRef, activeCommentId }: CommentNoteProps) {
  const comment = useFragment(
    graphql`
      fragment CommentNoteFragment on Comment {
        __typename

        dbid
        comment
        creationTime

        commenter {
          username
          ...ProfilePictureFragment
        }
        mentions {
          ...ProcessedTextFragment
        }
      }
    `,
    commentRef
  );

  // TEMPORARY FIX: not sure how this component is even being rendered without a truthy `comment`
  const timeAgo = comment?.creationTime ? getTimeSince(comment.creationTime) : null;
  const nonNullMentions = useMemo(
    () => removeNullValues(comment?.mentions || []),
    [comment?.mentions]
  );

  if (!comment) {
    return null;
  }
  // END TEMPORARY FIX

  const isCommentActive = activeCommentId === comment.dbid;

  return (
    <StyledListItem justify="space-between" gap={4} isHighlighted={isCommentActive}>
      <HStack gap={8}>
        {comment.commenter && (
          <StyledProfilePictureWrapper>
            <ProfilePicture size="sm" userRef={comment.commenter} />
          </StyledProfilePictureWrapper>
        )}

        <VStack>
          <HStack gap={4} align="center">
            <UsernameLink
              username={comment.commenter?.username ?? null}
              eventContext={contexts.Posts}
            />
            <StyledTimeAgoText color={colors.metal}>{timeAgo}</StyledTimeAgoText>
          </HStack>
          <StyledBaseM as="span">
            <ProcessedText
              text={comment.comment ?? ''}
              mentionsRef={nonNullMentions}
              eventContext={contexts.Social}
            />
          </StyledBaseM>
        </VStack>
      </HStack>
    </StyledListItem>
  );
}

const StyledProfilePictureWrapper = styled.div`
  margin-top: 4px;
`;

const StyledListItem = styled(ListItem)<{ isHighlighted?: boolean }>`
  padding: 0px 16px 16px;

  ${({ isHighlighted }) =>
    isHighlighted &&
    `
    background-color: ${colors.faint};
  `}
`;

const StyledBaseM = styled(BaseM)`
  word-wrap: break-word;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledTimeAgoText = styled(TimeAgoText)`
  font-size: 10px;
`;

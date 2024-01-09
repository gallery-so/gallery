import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import { ListItem } from '~/components/Feed/Socialize/CommentsModal/ListItem';
import { TimeAgoText } from '~/components/Feed/Socialize/CommentsModal/TimeAgoText';
import { UsernameLink } from '~/components/Feed/Socialize/CommentsModal/UsernameLink';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommentNoteFragment$key } from '~/generated/CommentNoteFragment.graphql';
import { CommentNoteQueryFragment$key } from '~/generated/CommentNoteQueryFragment.graphql';
import useAdmireComment from '~/hooks/api/posts/useAdmireComment';
import InfoCircleIcon from '~/icons/InfoCircleIcon';
import { AdmireIcon, IconWrapper } from '~/icons/SocializeIcons';
import { TrashIconNew } from '~/icons/TrashIconNew';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

import DeleteCommentConfirmation from './DeleteCommentConfirmation';

export type OnReplyClickParams = {
  username: string;
  commentId: string;
  comment: string;
  topCommentId?: string;
} | null;

type CommentNoteProps = {
  commentRef: CommentNoteFragment$key;
  queryRef: CommentNoteQueryFragment$key;
  activeCommentId?: string;
  isReply?: boolean;
  footerElement?: React.ReactNode;
  onReplyClick: (params: OnReplyClickParams) => void;
};

export function CommentNote({
  commentRef,
  activeCommentId,
  footerElement,
  isReply,
  onReplyClick,
  queryRef,
}: CommentNoteProps) {
  const comment = useFragment(
    graphql`
      fragment CommentNoteFragment on Comment {
        __typename

        dbid
        comment
        creationTime
        deleted

        commenter {
          dbid
          username
          ...ProfilePictureFragment
        }
        mentions {
          ...ProcessedTextFragment
        }
        ...useAdmireCommentFragment
        ...DeleteCommentConfirmationFragment
      }
    `,
    commentRef
  );

  const query = useFragment(
    graphql`
      fragment CommentNoteQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
        ...useAdmireCommentQueryFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();

  const { toggleAdmireComment, totalAdmires, hasViewerAdmiredComment } = useAdmireComment({
    commentRef: comment,
    queryRef: query,
  });

  const isAuthUserComment = useMemo(() => {
    return comment?.commenter?.dbid === query?.viewer?.user?.dbid;
  }, [comment?.commenter?.dbid, query?.viewer?.user?.dbid]);

  const handleReplyClick = useCallback(() => {
    onReplyClick({
      username: comment.commenter?.username ?? '',
      commentId: comment.dbid,
      comment: comment.comment ?? '',
    });
  }, [comment.comment, comment.commenter?.username, comment.dbid, onReplyClick]);

  const handleDeleteCommentConfirmation = useCallback(() => {
    showModal({
      content: <DeleteCommentConfirmation commentRef={comment} />,
      headerText: 'Delete Comment',
    });
  }, [comment, showModal]);

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
    <StyledListItem
      justify="space-between"
      gap={4}
      isHighlighted={isCommentActive}
      isReply={isReply}
    >
      {comment.deleted ? (
        <DeletedComment isReply={isReply} />
      ) : (
        <VStack gap={8} grow>
          <HStack align="center" justify="space-between">
            <HStack gap={8} grow>
              {comment.commenter && (
                <StyledProfilePictureWrapper>
                  <ProfilePicture size="sm" userRef={comment.commenter} />
                </StyledProfilePictureWrapper>
              )}

              <VStack grow>
                <HStack justify="space-between">
                  <HStack gap={4} align="flex-start">
                    <UsernameLink
                      username={comment.commenter?.username ?? null}
                      eventContext={contexts.Posts}
                    />
                    <StyledTimeAgoText color={colors.metal}>{timeAgo}</StyledTimeAgoText>
                  </HStack>

                  <HStack gap={4} align="items-center">
                    <HStack gap={2} align="items-center">
                      {totalAdmires > 0 && (
                        <StyledAdmiredTotal as="span" active={hasViewerAdmiredComment}>
                          {totalAdmires}
                        </StyledAdmiredTotal>
                      )}
                      <AdmireIcon
                        onClick={toggleAdmireComment}
                        width={16}
                        height={16}
                        active={hasViewerAdmiredComment}
                      />
                    </HStack>

                    {isAuthUserComment && (
                      <IconWrapper
                        role="button"
                        onClick={handleDeleteCommentConfirmation}
                        active={false}
                      >
                        <TrashIconNew color="currentColor" />
                      </IconWrapper>
                    )}
                  </HStack>
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
          </HStack>
          <VStack>
            <StyledCommentAndReplyButtonContainer gap={2}>
              <StyledReplyText role="button" onClick={handleReplyClick}>
                Reply
              </StyledReplyText>

              {footerElement}
            </StyledCommentAndReplyButtonContainer>
          </VStack>
        </VStack>
      )}
    </StyledListItem>
  );
}

const StyledProfilePictureWrapper = styled.div`
  margin-top: 4px;
`;

const StyledListItem = styled(ListItem)<{ isHighlighted?: boolean; isReply?: boolean }>`
  /* padding: 0px 16px 16px; */
  padding: 8px 16px;

  ${({ isReply }) =>
    isReply &&
    `
    padding-left: 48px;
  `}

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

const StyledReplyText = styled(BaseS)`
  color: ${colors.shadow};
  font-weight: 700;
  cursor: pointer;
`;

const StyledCommentAndReplyButtonContainer = styled(VStack)`
  margin-top: -2px;
  margin-left: 32px;
`;

const StyledAdmiredTotal = styled(BaseS)<{ active?: boolean }>`
  font-weight: 700;
  ${({ active }) => active && `color: ${colors.activeBlue};`}
`;

type DeletedCommentProps = {
  isReply?: boolean;
};

function DeletedComment({ isReply }: DeletedCommentProps) {
  return (
    <StyledDeletedCommentWrapper align="items-center" gap={4}>
      <InfoCircleIcon height={16} width={16} color={colors.shadow} />
      <StyledDeletedCommentText>
        This {isReply ? 'reply' : 'comment'} has been deleted
      </StyledDeletedCommentText>
    </StyledDeletedCommentWrapper>
  );
}

const StyledDeletedCommentWrapper = styled(HStack)`
  padding: 10px 12px;
  background-color: ${colors.offWhite};
  width: 100%;
`;

const StyledDeletedCommentText = styled(BaseM)`
  color: ${colors.shadow};
`;

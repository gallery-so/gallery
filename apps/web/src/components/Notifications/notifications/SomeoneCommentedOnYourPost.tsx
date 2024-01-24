import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneCommentedOnYourPostFragment$key } from '~/generated/SomeoneCommentedOnYourPostFragment.graphql';
import { SomeoneCommentedOnYourPostQueryFragment$key } from '~/generated/SomeoneCommentedOnYourPostQueryFragment.graphql';
import useAdmireComment from '~/hooks/api/posts/useAdmireComment';
import { AdmireIcon } from '~/icons/SocializeIcons';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';
import unescape from '~/shared/utils/unescape';

import { NotificationPostPreviewWithBoundary } from './NotificationPostPreview';

type Props = {
  notificationRef: SomeoneCommentedOnYourPostFragment$key;
  queryRef: SomeoneCommentedOnYourPostQueryFragment$key;
  onClose: () => void;
};

export default function SomeoneCommentedOnYourPost({ notificationRef, queryRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourPostFragment on SomeoneCommentedOnYourPostNotification {
        __typename
        dbid
        updatedTime
        post {
          dbid
          tokens {
            ...NotificationPostPreviewWithBoundaryFragment
          }
        }
        comment @required(action: THROW) {
          dbid
          commenter {
            username
            ...UserHoverCardFragment
            ...ProfilePictureFragment
          }
          comment
          ...useAdmireCommentFragment
          replyTo {
            dbid
          }
        }
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourPostQueryFragment on Query {
        ...useAdmireCommentQueryFragment
      }
    `,
    queryRef
  );

  const { comment } = notification;

  const { toggleAdmireComment, hasViewerAdmiredComment } = useAdmireComment({
    commentRef: comment,
    queryRef: query,
  });

  const reportError = useReportError();
  const { push } = useRouter();

  const token = notification.post?.tokens?.[0];

  if (!token) {
    throw new Error('Post does not have accompanying token');
  }

  const handleReply = useCallback(() => {
    const postId = notification.post?.dbid;
    const commentId = comment.dbid;
    if (postId && commentId) {
      const query = {
        postId,
        commentId,
        replyToCommentUsername: comment.commenter?.username || '',
        comment: comment.comment || '',
        topCommentId: comment.replyTo?.dbid || '',
      };
      push({ pathname: '/post/[postId]', query });
    }
  }, [
    comment.comment,
    comment.commenter?.username,
    comment.dbid,
    comment.replyTo?.dbid,
    notification.post?.dbid,
    push,
  ]);

  if (!comment || !comment.commenter || !comment.comment) {
    reportError(
      new Error(
        `SomeoneCommentedOnYourPostNotification id:${notification.dbid} was missing comment or commenter`
      )
    );
    return null;
  }

  const commenter = comment.commenter;
  const timeAgo = getTimeSince(notification.updatedTime);

  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <ProfilePicture size="md" userRef={commenter} />
        <VStack>
          <StyledTextWrapper align="center" as="span" wrap="wrap">
            <UserHoverCard userRef={commenter} onClick={onClose} />
            &nbsp;
            <BaseM as="span">
              commented on your <strong>post</strong>
            </BaseM>
            &nbsp;
            <TimeAgoText as="span">{timeAgo}</TimeAgoText>
          </StyledTextWrapper>
          <VStack gap={4}>
            <StyledCaption>{unescape(comment.comment)}</StyledCaption>

            <HStack gap={4}>
              <AdmireIcon
                active={hasViewerAdmiredComment}
                height={16}
                onClick={toggleAdmireComment}
              />
              <StyledBaseS as="span" onClick={handleReply}>
                Reply
              </StyledBaseS>
            </HStack>
          </VStack>
        </VStack>
      </HStack>
      <NotificationPostPreviewWithBoundary tokenRef={token} />
    </StyledNotificationContent>
  );
}

const StyledNotificationContent = styled(HStack)`
  width: 100%;
`;

const StyledCaption = styled(BaseM)`
  font-size: 12px;
  border-left: 2px solid ${colors.porcelain};
  padding-left: 8px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 1;
  -webkit-line-clamp: 1;
`;

const TimeAgoText = styled(BaseS)`
  color: ${colors.metal};
  white-space: nowrap;
  flex-shrink: 0;
`;

const StyledTextWrapper = styled(HStack)`
  display: inline;
`;

const StyledBaseS = styled(BaseS)`
  font-weight: 700;
`;

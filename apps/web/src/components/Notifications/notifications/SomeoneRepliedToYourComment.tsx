import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneRepliedToYourCommentFragment$key } from '~/generated/SomeoneRepliedToYourCommentFragment.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

import { NotificationPostPreviewWithBoundary } from './NotificationPostPreview';

type Props = {
  notificationRef: SomeoneRepliedToYourCommentFragment$key;
  onClose: () => void;
};

export function SomeoneRepliedToYourComment({ notificationRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment SomeoneRepliedToYourCommentFragment on SomeoneRepliedToYourCommentNotification {
        __typename
        dbid
        updatedTime
        comment {
          commenter {
            ...UserHoverCardFragment
            ...ProfilePictureFragment
          }
          comment
          source {
            ... on Post {
              tokens {
                ...NotificationPostPreviewWithBoundaryFragment
              }
            }
          }
        }
      }
    `,
    notificationRef
  );

  const { comment } = notification;

  const reportError = useReportError();

  const token = notification.comment?.source?.tokens?.[0];

  if (!token) {
    throw new Error('Post does not have accompanying token');
  }

  if (!comment || !comment.commenter || !comment.comment) {
    reportError(
      new Error(
        `SomeoneRepliedToYourCommentNotification id:${notification.dbid} was missing comment or commenter`
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
              replied to your <strong>comment</strong>
            </BaseM>
            &nbsp;
            <TimeAgoText as="span">{timeAgo}</TimeAgoText>
          </StyledTextWrapper>
          <StyledCaption>{comment.comment}</StyledCaption>
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

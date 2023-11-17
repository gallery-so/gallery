import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneMentionedYouFragment$key } from '~/generated/SomeoneMentionedYouFragment.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import colors from '~/shared/theme/colors';

import { NotificationPostPreviewWithBoundary } from './NotificationPostPreview';

type Props = {
  notificationRef: SomeoneMentionedYouFragment$key;
  onClose: () => void;
};

export function SomeoneMentionedYou({ notificationRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment SomeoneMentionedYouFragment on SomeoneMentionedYouNotification {
        __typename
        dbid
        mentionSource @required(action: THROW) {
          __typename
          ... on Post {
            __typename
            dbid
            caption
            author {
              ...UserHoverCardFragment
              ...ProfilePictureFragment
            }
            tokens {
              __typename
              ...NotificationPostPreviewWithBoundaryFragment
            }
          }
          ... on Comment {
            __typename
            dbid
            commenter {
              ...UserHoverCardFragment
              ...ProfilePictureFragment
            }
            source {
              ... on Post {
                __typename
                dbid
                tokens {
                  __typename
                  ...NotificationPostPreviewWithBoundaryFragment
                }
              }
              ... on FeedEvent {
                __typename
                dbid
              }
            }
            comment
          }
        }
      }
    `,
    notificationRef
  );

  const reportError = useReportError();

  const notificationData = useMemo(() => {
    if (notification?.mentionSource?.__typename === 'Post') {
      return {
        author: notification.mentionSource?.author,
        message: notification.mentionSource?.caption ?? '',
        type: 'post',
        token: notification.mentionSource?.tokens?.[0] ?? null,
      };
    }

    if (notification?.mentionSource?.__typename === 'Comment') {
      const { mentionSource } = notification;
      const author = mentionSource?.commenter;
      const message = mentionSource?.comment ?? '';

      let token = null;

      if (mentionSource.source?.__typename === 'Post') {
        token = mentionSource?.source?.tokens?.[0] ?? null;
      }

      return { author, message, type: 'comment', token };
    }

    return null;
  }, [notification]);

  if (!notificationData) return null;

  const { author, message, type, token } = notificationData;

  if (!author) {
    reportError(
      new Error(`SomeoneMentionedYou id:${notification.dbid} was missing author or commenter`)
    );
    return null;
  }

  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <ProfilePicture size="md" userRef={author} />
        <VStack>
          <StyledTextWrapper align="center" as="span" wrap="wrap">
            <UserHoverCard userRef={author} onClick={onClose} />
            &nbsp;
            <BaseM as="span">
              mentioned you in a <strong>{type}</strong>
            </BaseM>
          </StyledTextWrapper>
          <StyledCaption>{message}</StyledCaption>
        </VStack>
      </HStack>
      {token && <NotificationPostPreviewWithBoundary tokenRef={token} />}
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
  line-clamp: 2;
  -webkit-line-clamp: 2;
`;

const StyledTextWrapper = styled(HStack)`
  display: inline;
`;

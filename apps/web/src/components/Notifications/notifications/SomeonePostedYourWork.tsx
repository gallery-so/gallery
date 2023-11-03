import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeonePostedYourWorkFragment$key } from '~/generated/SomeonePostedYourWorkFragment.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';

import { NotificationPostPreviewWithBoundary } from './NotificationPostPreview';

type Props = {
  notificationRef: SomeonePostedYourWorkFragment$key;
  onClose: () => void;
};

export default function SomeonePostedYourWork({ notificationRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment SomeonePostedYourWorkFragment on SomeonePostedYourWorkNotification {
        __typename
        dbid
        post {
          dbid
          author {
            ...UserHoverCardFragment
            ...ProfilePictureFragment
          }
          tokens {
            name
            ...NotificationPostPreviewWithBoundaryFragment
          }
        }
      }
    `,
    notificationRef
  );
  const { post } = notification;
  const token = notification.post?.tokens?.[0];

  const reportError = useReportError();

  if (!token) {
    throw new Error('Post does not have accompanying token');
  }

  if (!post || !post.author) {
    reportError(
      new Error(`SomeonePostedYourWork id:${notification.dbid} was missing post or author`)
    );
    return null;
  }
  const postAuthor = post.author;

  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <ProfilePicture size="md" userRef={postAuthor} />
        <VStack>
          <StyledTextWrapper align="center" as="span" wrap="wrap">
            <UserHoverCard userRef={postAuthor} onClick={onClose} />
            &nbsp;
            <BaseM as="span">
              shared your <strong>work</strong>
            </BaseM>
          </StyledTextWrapper>
          <StyledCaption as="span">
            <strong>{token?.name}</strong>
          </StyledCaption>
        </VStack>
      </HStack>
      <NotificationPostPreviewWithBoundary tokenRef={token} />
    </StyledNotificationContent>
  );
}

const StyledNotificationContent = styled(HStack)`
  width: 100%;
`;

const StyledTextWrapper = styled(HStack)`
  display: inline;
`;

const StyledCaption = styled(BaseM)`
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 1;
  -webkit-line-clamp: 1;
`;

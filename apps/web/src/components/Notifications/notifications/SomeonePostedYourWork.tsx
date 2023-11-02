import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeonePostedYourWorkFragment$key } from '~/generated/SomeonePostedYourWorkFragment.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import colors from '~/shared/theme/colors';
import unescape from '~/shared/utils/unescape';

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
            username
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
          <BaseM as="span">
            <strong>{token.name}</strong>
          </BaseM>
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

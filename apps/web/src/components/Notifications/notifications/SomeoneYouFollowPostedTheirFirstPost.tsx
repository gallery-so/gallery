import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneYouFollowPostedTheirFirstPostFragment$key } from '~/generated/SomeoneYouFollowPostedTheirFirstPostFragment.graphql';

import { NotificationPostPreviewWithBoundary } from './NotificationPostPreview';

type Props = {
  notificationRef: SomeoneYouFollowPostedTheirFirstPostFragment$key;
  onClose: () => void;
};

export function SomeoneYouFollowPostedTheirFirstPost({ notificationRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment SomeoneYouFollowPostedTheirFirstPostFragment on SomeoneYouFollowPostedTheirFirstPostNotification {
        __typename
        dbid
        post {
          author {
            ...ProfilePictureFragment
            ...UserHoverCardFragment
          }
          tokens {
            ...NotificationPostPreviewWithBoundaryFragment
          }
        }
      }
    `,
    notificationRef
  );

  const { post } = notification;

  if (!post || !post.author) {
    reportError(
      new Error(`SomeonePostedYourWork id:${notification.dbid} was missing post or author`)
    );
    return null;
  }
  const token = post.tokens?.[0];

  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <ProfilePicture size="md" userRef={post.author} />
        <VStack>
          <StyledTextWrapper align="center" as="span" wrap="wrap">
            <UserHoverCard userRef={post.author} onClick={onClose} />
            &nbsp;
            <BaseM as="span">
              created their first <strong>post</strong>
            </BaseM>
          </StyledTextWrapper>
        </VStack>
      </HStack>
      {token && <NotificationPostPreviewWithBoundary tokenRef={token} />}
    </StyledNotificationContent>
  );
}

const StyledNotificationContent = styled(HStack)`
  width: 100%;
`;

const StyledTextWrapper = styled(HStack)`
  display: inline;
`;

import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneAdmiredYourPostFragment$key } from '~/generated/SomeoneAdmiredYourPostFragment.graphql';
import { AdmireIcon } from '~/icons/SocializeIcons';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';

import { NotificationPostPreviewWithBoundary } from './NotificationPostPreview';
import { StyledAdmireIconWrapper } from './SomeoneAdmiredYourToken';

type Props = {
  notificationRef: SomeoneAdmiredYourPostFragment$key;
  onClose: () => void;
};

export default function SomeoneAdmiredYourPost({ notificationRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment SomeoneAdmiredYourPostFragment on SomeoneAdmiredYourPostNotification {
        __typename
        dbid
        post {
          tokens {
            ...NotificationPostPreviewWithBoundaryFragment
          }
        }
        count

        admirers(last: 1) {
          edges {
            node {
              ...UserHoverCardFragment
              ...ProfilePictureFragment
            }
          }
        }
      }
    `,
    notificationRef
  );

  const notificationCount = notification.count ?? 1;

  const firstAdmirer = notification.admirers?.edges?.[0]?.node;

  if (!firstAdmirer) {
    throw new ErrorWithSentryMetadata('SomeoneAdmiredYourPostNotification was missing admirer', {
      id: notification.dbid,
    });
  }

  const token = notification.post?.tokens?.[0];

  if (!token) {
    throw new Error('Post does not have accompanying token');
  }

  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <StyledProfilePictureWrapper>
          <ProfilePicture size="md" userRef={firstAdmirer} />
          <StyledAdmireIconWrapper align="center" justify="center">
            <AdmireIcon active height={12} />
          </StyledAdmireIconWrapper>
        </StyledProfilePictureWrapper>
        <StyledTextWrapper align="center" as="span" wrap="wrap">
          <UserHoverCard userRef={firstAdmirer} onClick={onClose} />
          &nbsp;
          <BaseM as="span">
            {notificationCount > 1 && (
              <>
                {'and '}
                <strong>
                  {notificationCount - 1} other{notificationCount - 1 > 1 && 's'}&nbsp;
                </strong>
              </>
            )}
            admired your <strong>post</strong>
          </BaseM>
        </StyledTextWrapper>
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

const StyledProfilePictureWrapper = styled.div`
  position: relative;
`;

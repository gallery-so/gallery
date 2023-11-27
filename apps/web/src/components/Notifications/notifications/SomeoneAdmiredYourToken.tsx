import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneAdmiredYourTokenFragment$key } from '~/generated/SomeoneAdmiredYourTokenFragment.graphql';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';

import { NotificationPostPreviewWithBoundary } from './NotificationPostPreview';

type Props = {
  notificationRef: SomeoneAdmiredYourTokenFragment$key;
  onClose: () => void;
};

export default function SomeoneAdmiredYourToken({ notificationRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment SomeoneAdmiredYourTokenFragment on SomeoneAdmiredYourTokenNotification {
        __typename
        dbid
        token {
          name

          ...NotificationPostPreviewWithBoundaryFragment
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
    throw new ErrorWithSentryMetadata('SomeoneAdmiredYourTokenNotification was missing admirer', {
      id: notification.dbid,
    });
  }

  const token = notification.token;

  if (!token) {
    throw new Error('Notification does not have accompanying token');
  }

  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <ProfilePicture size="md" userRef={firstAdmirer} />
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
            admired your <strong>{token.name ?? 'item'}</strong>
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

import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneAdmiredYourTokenFragment$key } from '~/generated/SomeoneAdmiredYourTokenFragment.graphql';
import { AdmireIcon } from '~/icons/SocializeIcons';
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
          definition {
            name
          }
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
            admired your <strong>{token.definition.name ?? 'item'}</strong>
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

export const StyledAdmireIconWrapper = styled(VStack)`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #e5e8fd;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  border: 1px solid ${colors.offWhite};
`;

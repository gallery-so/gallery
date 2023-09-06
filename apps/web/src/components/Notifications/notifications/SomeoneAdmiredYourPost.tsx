import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneAdmiredYourPostFragment$key } from '~/generated/SomeoneAdmiredYourPostFragment.graphql';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

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
            ...useGetPreviewImagesSingleFragment
          }
        }
        count

        admirers(last: 1) {
          edges {
            node {
              ...HoverCardOnUsernameFragment
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

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'small' });

  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <ProfilePicture size="md" userRef={firstAdmirer} />
        <StyledTextWrapper align="center" as="span" wrap="wrap">
          <HoverCardOnUsername userRef={firstAdmirer} onClick={onClose} />
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
      {imageUrl && <StyledPostPreview src={imageUrl} />}
    </StyledNotificationContent>
  );
}

const StyledPostPreview = styled.img`
  height: 56px;
  width: 56px;
`;

const StyledNotificationContent = styled(HStack)`
  width: 100%;
`;

const StyledTextWrapper = styled(HStack)`
  display: inline;
`;

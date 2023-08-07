import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneAdmiredYourPostFragment$key } from '~/generated/SomeoneAdmiredYourPostFragment.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

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
            ...getVideoOrImageUrlForNftPreviewFragment
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
  const reportError = useReportError();
  const notificationCount = notification.count ?? 1;

  const firstAdmirer = notification.admirers?.edges?.[0]?.node;
  const token = notification.post?.tokens?.[0];
  const previewUrlSet = useMemo(() => {
    if (!token) return null;
    return getVideoOrImageUrlForNftPreview({ tokenRef: token });
  }, [token]);

  if (!firstAdmirer) {
    reportError(`SomeoneAdmiredYourPostNotification id:${notification.dbid} was missing admirer`);
    return null;
  }

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
      {previewUrlSet?.urls.small && <StyledPostPreview src={previewUrlSet?.urls.small} />}
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

import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneAdmiredYourCommentFragment$key } from '~/generated/SomeoneAdmiredYourCommentFragment.graphql';
import { AdmireIcon } from '~/icons/SocializeIcons';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import unescape from '~/shared/utils/unescape';

import { NotificationPostPreviewWithBoundary } from './NotificationPostPreview';

type Props = {
  notificationRef: SomeoneAdmiredYourCommentFragment$key;
  onClose: () => void;
};

export default function SomeoneAdmiredYourComment({ notificationRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment SomeoneAdmiredYourCommentFragment on SomeoneAdmiredYourCommentNotification {
        __typename
        dbid
        count
        comment {
          comment
          source {
            __typename
            ... on Post {
              dbid
              tokens {
                ...NotificationPostPreviewWithBoundaryFragment
              }
            }
          }
        }

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
  const { comment } = notification;

  const notificationCount = notification.count ?? 1;

  const firstAdmirer = notification.admirers?.edges?.[0]?.node;

  let token;
  if (comment?.source?.__typename === 'Post') {
    token = comment.source.tokens?.[0];
  }

  if (!firstAdmirer) {
    throw new ErrorWithSentryMetadata('SomeoneAdmiredYourCommentNotification was missing admirer', {
      id: notification.dbid,
    });
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
        <VStack>
          <VStack gap={4}>
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
                admired your {''}
                <strong>comment</strong>
              </BaseM>
            </StyledTextWrapper>
            <StyledCaption>{unescape(comment?.comment ?? '')}</StyledCaption>
          </VStack>
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

const StyledProfilePictureWrapper = styled.div`
  position: relative;
`;

const StyledAdmireIconWrapper = styled(VStack)`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #e5e8fd;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  border: 1px solid ${colors.offWhite};
`;

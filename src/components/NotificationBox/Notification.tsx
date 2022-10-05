import { NotificationType } from 'components/NotificationBox/NotificationDropdown';
import styled from 'styled-components';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import colors from 'components/core/colors';
import { BaseM, BaseS } from 'components/core/Text/Text';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';

export function Notification({ notification }: { notification: NotificationType }) {
  return (
    <Container>
      <HStack gap={8} align="center">
        {!notification.seen && (
          <UnseenDotContainer>
            <UnseenDot />
          </UnseenDotContainer>
        )}
        <NotificationInner notification={notification} />
        <HStack grow justify="flex-end">
          <BaseS color={colors.metal}>{notification.timeAgo}</BaseS>
        </HStack>
      </HStack>
    </Container>
  );
}

function NotificationInner({ notification }: { notification: NotificationType }) {
  if (notification.kind === 'admired') {
    return (
      <>
        <BaseM>
          <strong>
            {notification.count > 1 ? (
              <>{notification.count} collectors</>
            ) : (
              <>{notification.who}</>
            )}
          </strong>{' '}
          admired your additions to{' '}
          <InteractiveLink href={'https://google.com'}>
            {notification.collectionName}
          </InteractiveLink>
        </BaseM>
      </>
    );
  } else if (notification.kind === 'commented') {
    return (
      <VStack gap={8}>
        <BaseM>
          <strong>{notification.who}</strong> commented on your additions to{' '}
          <InteractiveLink href={'https://google.com'}>
            {notification.collectionName}
          </InteractiveLink>
        </BaseM>

        <CommentPreviewContainer>
          <BaseM>{notification.commentText}</BaseM>
        </CommentPreviewContainer>
      </VStack>
    );
  } else if (notification.kind === 'viewed') {
    return (
      <>
        <BaseM>
          <strong>
            {notification.count > 1 ? (
              <>{notification.count} collectors</>
            ) : (
              <>{notification.who}</>
            )}
          </strong>{' '}
          viewed your gallery
        </BaseM>
      </>
    );
  } else if (notification.kind === 'followed') {
    return (
      <>
        <BaseM>
          <strong>
            {notification.count > 1 ? (
              <>{notification.count} collectors</>
            ) : (
              <>{notification.who}</>
            )}
          </strong>{' '}
          followed you
        </BaseM>
      </>
    );
  }

  return null;
}
const CommentPreviewContainer = styled.div`
  margin-left: 16px;
  padding-left: 8px;

  border-left: 2px solid #d9d9d9;
`;

const UnseenDotContainer = styled.div`
  align-self: stretch;
`;

const UnseenDot = styled.div`
  width: 8px;
  height: 8px;

  background-color: ${colors.hyperBlue};
  border-radius: 9999px;
`;

const Container = styled.div`
  padding: 16px 12px;
`;

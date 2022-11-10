import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled, { css } from 'styled-components';

import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { NotificationArrow } from '~/components/NotificationsModal/NotificationArrow';
import { SomeoneAdmiredYourFeedEvent } from '~/components/NotificationsModal/notifications/SomeoneAdmiredYourFeedEvent';
import { SomeoneCommentedOnYourFeedEvent } from '~/components/NotificationsModal/notifications/SomeoneCommentedOnYourFeedEvent';
import { SomeoneFollowedYou } from '~/components/NotificationsModal/notifications/SomeoneFollowedYou';
import { SomeoneFollowedYouBack } from '~/components/NotificationsModal/notifications/SomeoneFollowedYouBack';
import { SomeoneViewedYourGallery } from '~/components/NotificationsModal/notifications/SomeoneViewedYourGallery';
import { NotificationUserListModal } from '~/components/NotificationsModal/NotificationUserListModal';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationInnerFragment$key } from '~/generated/NotificationInnerFragment.graphql';
import { NotificationInnerQueryFragment$key } from '~/generated/NotificationInnerQueryFragment.graphql';
import { NotificationQueryFragment$key } from '~/generated/NotificationQueryFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { getTimeSince } from '~/utils/time';

type NotificationProps = {
  notificationRef: NotificationFragment$key;
  queryRef: NotificationQueryFragment$key;
};

export function Notification({ notificationRef, queryRef }: NotificationProps) {
  const notification = useFragment(
    graphql`
      fragment NotificationFragment on Notification {
        id
        seen
        updatedTime

        __typename

        ... on SomeoneCommentedOnYourFeedEventNotification {
          feedEvent {
            dbid
          }
        }

        ... on SomeoneAdmiredYourFeedEventNotification {
          feedEvent {
            dbid
          }
        }

        ... on GroupedNotification {
          count
        }

        ...NotificationInnerFragment
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment NotificationQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }

        ...NotificationInnerQueryFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();
  const { push } = useRouter();
  const isMobile = useIsMobileWindowWidth();

  /**
   * Bare with me here, this `useMemo` returns a stable function
   * if we want that notification type to have a clickable action.
   *
   * If the notification should not be clickable, we return undefined
   * instead of a function. Signaling downstream that this notification
   * is not actionable.
   */
  const handleNotificationClick = useMemo(() => {
    if (notification.feedEvent) {
      const username = query.viewer?.user?.username;
      const eventId = notification.feedEvent.dbid;

      return function navigateToUserActivityWithFeedEventAtTop() {
        if (username && eventId) {
          push({ pathname: '/[username]/activity', query: { username, eventId } });
        }
      };
    } else if (notification.count && notification.count > 1) {
      return function showUserListModal() {
        showModal({
          content: (
            <NotificationUserListModal notificationId={notification.id} fullscreen={isMobile} />
          ),
          isFullPage: isMobile,
          isPaddingDisabled: true,
          headerVariant: 'standard',
        });
      };
    }

    return undefined;
  }, [
    isMobile,
    notification.count,
    notification.feedEvent,
    notification.id,
    push,
    query.viewer?.user?.username,
    showModal,
  ]);

  const isClickable = handleNotificationClick != undefined;

  const timeAgo = getTimeSince(notification.updatedTime);

  return (
    <Container isClickable={isClickable} onClick={handleNotificationClick}>
      <HStack gap={8} align="center">
        {!notification.seen && (
          <UnseenDotContainer>
            <UnseenDot />
          </UnseenDotContainer>
        )}
        <NotificationInner queryRef={query} notificationRef={notification} />
        <HStack grow justify="flex-end" gap={16}>
          <TimeAgoText color={colors.metal}>{timeAgo}</TimeAgoText>
          {isClickable && <NotificationArrow />}
        </HStack>
      </HStack>
    </Container>
  );
}

type NotificationInnerProps = {
  notificationRef: NotificationInnerFragment$key;
  queryRef: NotificationInnerQueryFragment$key;
};

function NotificationInner({ notificationRef, queryRef }: NotificationInnerProps) {
  const query = useFragment(
    graphql`
      fragment NotificationInnerQueryFragment on Query {
        ...SomeoneCommentedOnYourFeedEventQueryFragment
        ...SomeoneAdmiredYourFeedEventQueryFragment
        ...SomeoneFollowedYouBackQueryFragment
        ...SomeoneFollowedYouQueryFragment
        ...SomeoneViewedYourGalleryQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment NotificationInnerFragment on Notification {
        ... on SomeoneFollowedYouNotification {
          __typename
          ...SomeoneFollowedYouFragment
        }

        ... on SomeoneFollowedYouBackNotification {
          __typename
          ...SomeoneFollowedYouBackFragment
        }

        ... on SomeoneAdmiredYourFeedEventNotification {
          __typename
          ...SomeoneAdmiredYourFeedEventFragment
        }

        ... on SomeoneCommentedOnYourFeedEventNotification {
          __typename
          ...SomeoneCommentedOnYourFeedEventFragment
        }

        ... on SomeoneViewedYourGalleryNotification {
          __typename
          ...SomeoneViewedYourGalleryFragment
        }
      }
    `,
    notificationRef
  );

  if (notification.__typename === 'SomeoneAdmiredYourFeedEventNotification') {
    return <SomeoneAdmiredYourFeedEvent queryRef={query} notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneViewedYourGalleryNotification') {
    return <SomeoneViewedYourGallery queryRef={query} notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneFollowedYouNotification') {
    return <SomeoneFollowedYou queryRef={query} notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneFollowedYouBackNotification') {
    return <SomeoneFollowedYouBack queryRef={query} notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneCommentedOnYourFeedEventNotification') {
    return <SomeoneCommentedOnYourFeedEvent queryRef={query} notificationRef={notification} />;
  }

  return null;
}

export const TimeAgoText = styled(BaseS)`
  white-space: nowrap;
  flex-shrink: 0;
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

const Container = styled.div<{ isClickable: boolean }>`
  padding: 16px 12px;

  ${({ isClickable }) =>
    isClickable
      ? css`
          cursor: pointer;
        `
      : css``};

  :hover {
    background-color: ${colors.faint};
  }
`;

import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { ConnectionHandler, graphql } from 'relay-runtime';
import styled, { css } from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { NotificationArrow } from '~/components/Notifications/NotificationArrow';
import { SomeoneAdmiredYourFeedEvent } from '~/components/Notifications/notifications/SomeoneAdmiredYourFeedEvent';
import { SomeoneCommentedOnYourFeedEvent } from '~/components/Notifications/notifications/SomeoneCommentedOnYourFeedEvent';
import { SomeoneFollowedYou } from '~/components/Notifications/notifications/SomeoneFollowedYou';
import { SomeoneFollowedYouBack } from '~/components/Notifications/notifications/SomeoneFollowedYouBack';
import { SomeoneViewedYourGallery } from '~/components/Notifications/notifications/SomeoneViewedYourGallery';
import { NotificationUserListPage } from '~/components/Notifications/NotificationUserListPage';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationInnerFragment$key } from '~/generated/NotificationInnerFragment.graphql';
import { NotificationQueryFragment$key } from '~/generated/NotificationQueryFragment.graphql';
import { useClearNotifications } from '~/shared/relay/useClearNotifications';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

type NotificationProps = {
  notificationRef: NotificationFragment$key;
  queryRef: NotificationQueryFragment$key;
  toggleSubView: (page?: JSX.Element) => void;
};

export function Notification({ notificationRef, queryRef, toggleSubView }: NotificationProps) {
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

        ... on SomeoneViewedYourGalleryNotification {
          userViewers(last: 3) {
            pageInfo {
              total
            }
          }
        }

        ... on GroupedNotification {
          count
        }

        ...NotificationInnerFragment
      }
    `,
    notificationRef,
  );

  const query = useFragment(
    graphql`
      fragment NotificationQueryFragment on Query {
        ...NotificationInnerQueryFragment

        ...FollowButtonQueryFragment
        viewer {
          ... on Viewer {
            id
            user {
              username
              dbid
            }
          }
        }
      }
    `,
    queryRef,
  );

  const { push } = useRouter();

  const clearAllNotifications = useClearNotifications();

  /**
   * Bear with me here, this `useMemo` returns a stable function
   * if we want that notification type to have a clickable action.
   *
   * If the notification should not be clickable, we return undefined
   * instead of a function. Signaling downstream that this notification
   * is not actionable.
   */
  type NotificationClick =
    | {
        handleClick: () => void;
        showCaret: boolean;
      }
    | undefined;

  const handleNotificationClick = useMemo((): NotificationClick => {
    function showUserListModal() {
      toggleSubView(
        <NotificationUserListPage notificationId={notification.id} toggleSubView={toggleSubView} />,
      );
    }

    if (notification.feedEvent) {
      const username = query.viewer?.user?.username;
      const eventId = notification.feedEvent.dbid;

      return {
        showCaret: false,
        handleClick: function navigateToUserActivityWithFeedEventAtTop() {
          if (username && eventId) {
            push({ pathname: '/[username]/activity', query: { username, eventId } });
          }
        },
      };
    } else if (notification.__typename === 'SomeoneViewedYourGalleryNotification') {
      const count = notification.userViewers?.pageInfo?.total ?? 0;

      if (count > 1) {
        return { handleClick: showUserListModal, showCaret: true };
      }

      return undefined;
    } else if (notification.count && notification.count > 1) {
      return { showCaret: true, handleClick: showUserListModal };
    }

    return undefined;
  }, [
    notification.__typename,
    notification.count,
    notification.feedEvent,
    notification.id,
    notification.userViewers?.pageInfo?.total,
    push,
    query.viewer?.user?.username,
    toggleSubView,
  ]);

  const isClickable = handleNotificationClick != undefined;
  const handleClick = useCallback(() => {
    handleNotificationClick?.handleClick();
    if (!query.viewer?.user?.dbid || !query.viewer.id) {
      return;
    }

    clearAllNotifications(query.viewer.user.dbid, [
      ConnectionHandler.getConnectionID(query.viewer.id, 'NotificationsFragment_notifications'),
      ConnectionHandler.getConnectionID(query.viewer.id, 'StandardSidebarFragment_notifications'),
    ]);
  }, [clearAllNotifications, handleNotificationClick, query.viewer]);
  const showCaret = handleNotificationClick?.showCaret ?? false;

  const timeAgo = getTimeSince(notification.updatedTime);

  return (
    <Container isClickable={isClickable} onClick={handleClick}>
      <HStack gap={8} align="center">
        {!notification.seen && (
          <UnseenDotContainer>
            <UnseenDot />
          </UnseenDotContainer>
        )}
        <NotificationInner notificationRef={notification} />
        <HStack grow justify="flex-end" gap={16}>
          <TimeAgoText color={colors.metal}>{timeAgo}</TimeAgoText>
          {showCaret && <NotificationArrow />}
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
    notificationRef,
  );

  const query = useFragment(
    graphql`
      fragment NotificationInnerQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef,
  );

  const { hideDrawer } = useDrawerActions();
  const handleClose = useCallback(() => {
    hideDrawer();
  }, [hideDrawer]);

  if (notification.__typename === 'SomeoneAdmiredYourFeedEventNotification') {
    return <SomeoneAdmiredYourFeedEvent notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneViewedYourGalleryNotification') {
    return <SomeoneViewedYourGallery notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneFollowedYouNotification') {
    return (
      <SomeoneFollowedYou notificationRef={notification} queryRef={query} onClose={handleClose} />
    );
  } else if (notification.__typename === 'SomeoneFollowedYouBackNotification') {
    return <SomeoneFollowedYouBack notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneCommentedOnYourFeedEventNotification') {
    return <SomeoneCommentedOnYourFeedEvent notificationRef={notification} onClose={handleClose} />;
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
          :hover {
            background-color: ${colors.faint};
          }
        `
      : css``};
`;

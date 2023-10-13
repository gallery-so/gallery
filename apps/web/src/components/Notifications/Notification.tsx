import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { ConnectionHandler, graphql } from 'relay-runtime';
import styled, { css } from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { SomeoneAdmiredYourFeedEvent } from '~/components/Notifications/notifications/SomeoneAdmiredYourFeedEvent';
import { SomeoneCommentedOnYourFeedEvent } from '~/components/Notifications/notifications/SomeoneCommentedOnYourFeedEvent';
import { SomeoneFollowedYou } from '~/components/Notifications/notifications/SomeoneFollowedYou';
import { SomeoneFollowedYouBack } from '~/components/Notifications/notifications/SomeoneFollowedYouBack';
import { SomeoneViewedYourGallery } from '~/components/Notifications/notifications/SomeoneViewedYourGallery';
import { NotificationUserListPage } from '~/components/Notifications/NotificationUserListPage';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationInnerFragment$key } from '~/generated/NotificationInnerFragment.graphql';
import { NotificationInnerQueryFragment$key } from '~/generated/NotificationInnerQueryFragment.graphql';
import { NotificationQueryFragment$key } from '~/generated/NotificationQueryFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { useClearNotifications } from '~/shared/relay/useClearNotifications';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

import { NewTokens } from './notifications/NewTokens';
import SomeoneAdmiredYourPost from './notifications/SomeoneAdmiredYourPost';
import SomeoneCommentedOnYourPost from './notifications/SomeoneCommentedOnYourPost';

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

        ... on SomeoneAdmiredYourPostNotification {
          post {
            dbid
          }
        }

        ... on SomeoneCommentedOnYourPostNotification {
          post {
            dbid
          }
        }

        ... on NewTokensNotification {
          __typename
        }

        ...NotificationInnerFragment
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment NotificationQueryFragment on Query {
        ...NotificationInnerQueryFragment

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
    queryRef
  );

  const { push } = useRouter();

  const clearAllNotifications = useClearNotifications();
  const { hideDrawer } = useDrawerActions();

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
        <NotificationUserListPage notificationId={notification.id} toggleSubView={toggleSubView} />
      );
    }

    if (notification.feedEvent) {
      const username = query.viewer?.user?.username;
      const eventId = notification.feedEvent.dbid;

      return {
        showCaret: false,
        handleClick: function navigateToUserActivityWithFeedEventAtTop() {
          if (username && eventId) {
            push({ pathname: '/[username]/posts', query: { username, eventId } });
          }
          hideDrawer();
        },
      };
    } else if (notification.post) {
      const username = query.viewer?.user?.username;
      const postId = notification.post.dbid;

      return {
        showCaret: false,
        handleClick: function navigateToPostPage() {
          if (username && postId) {
            push({ pathname: '/post/[postId]', query: { postId } });
          }
          hideDrawer();
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
    hideDrawer,
    notification.__typename,
    notification.count,
    notification.feedEvent,
    notification.id,
    notification.post,
    notification.userViewers?.pageInfo?.total,
    push,
    query.viewer?.user?.username,
    toggleSubView,
  ]);

  const isClickable = Boolean(handleNotificationClick);

  const track = useTrack();

  const handleClick = useCallback(() => {
    if (handleNotificationClick?.handleClick) {
      track('Notification Click', {
        id: 'Notification Row',
        variant: notification.__typename,
        context: contexts.Notifications,
      });
      handleNotificationClick.handleClick();
    }

    if (!query.viewer?.user?.dbid || !query.viewer.id) {
      return;
    }

    clearAllNotifications(query.viewer.user.dbid, [
      ConnectionHandler.getConnectionID(query.viewer.id, 'NotificationsFragment_notifications'),
      ConnectionHandler.getConnectionID(query.viewer.id, 'StandardSidebarFragment_notifications'),
    ]);
  }, [
    clearAllNotifications,
    handleNotificationClick,
    notification.__typename,
    query.viewer?.id,
    query.viewer?.user?.dbid,
    track,
  ]);

  const timeAgo = getTimeSince(notification.updatedTime);

  if (
    ![
      'SomeoneAdmiredYourFeedEventNotification',
      'SomeoneCommentedOnYourFeedEventNotification',
      'SomeoneFollowedYouNotification',
      'SomeoneFollowedYouBackNotification',
      'SomeoneViewedYourGalleryNotification',
      'SomeoneAdmiredYourPostNotification',
      'SomeoneCommentedOnYourPostNotification',
      'NewTokensNotification',
    ].includes(notification.__typename)
  ) {
    return null;
  }

  // Leaving this commented in for now in case we regret this decision.
  // If the token is syncing or invalid -> we may still want them to post about it,
  // especially at the Marfa event. but this might litter the feed with wonky tokens.
  // On the flip side, if we don't show the notification, our system will feel like
  // it's slow.
  //
  // If the notification is a new token notification and the token is invalid, we don't want to show it
  // if (
  //   notification.__typename === 'NewTokensNotification' &&
  //   ['SyncingMedia', 'InvalidMedia'].includes(notification.token?.media?.__typename ?? '')
  // ) {
  //   return null;
  // }

  if (
    notification.__typename === 'SomeoneCommentedOnYourPostNotification' ||
    notification.__typename === 'SomeoneAdmiredYourPostNotification'
  ) {
    if (!notification.post) {
      return null;
    }
  }

  return (
    <ReportingErrorBoundary fallback={null}>
      <Container isClickable={isClickable} onClick={handleClick}>
        <HStack gap={8} align="center" justify="space-between">
          <NotificationInner notificationRef={notification} queryRef={query} />
          <StyledDotAndTimeAgo align="center" gap={4}>
            <HStack grow justify="flex-end" gap={16}>
              <TimeAgoText color={colors.metal}>{timeAgo}</TimeAgoText>
            </HStack>
            {!notification.seen && (
              <UnseenDotContainer>
                <UnseenDot />
              </UnseenDotContainer>
            )}
          </StyledDotAndTimeAgo>
        </HStack>
      </Container>
    </ReportingErrorBoundary>
  );
}

const StyledDotAndTimeAgo = styled(HStack)`
  width: 35px;
`;

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

        ... on SomeoneAdmiredYourPostNotification {
          __typename
          ...SomeoneAdmiredYourPostFragment
        }

        ... on SomeoneCommentedOnYourPostNotification {
          __typename
          ...SomeoneCommentedOnYourPostFragment
        }

        ... on NewTokensNotification {
          __typename
          ...NewTokensFragment
        }
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment NotificationInnerQueryFragment on Query {
        ...SomeoneFollowedYouQueryFragment
      }
    `,
    queryRef
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
  } else if (notification.__typename === 'SomeoneAdmiredYourPostNotification') {
    return <SomeoneAdmiredYourPost notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'SomeoneCommentedOnYourPostNotification') {
    return <SomeoneCommentedOnYourPost notificationRef={notification} onClose={handleClose} />;
  } else if (notification.__typename === 'NewTokensNotification') {
    return <NewTokens notificationRef={notification} onClose={handleClose} />;
  }

  return null;
}

export const TimeAgoText = styled(BaseS)`
  white-space: nowrap;
  flex-shrink: 0;
`;

const UnseenDotContainer = styled.div`
  align-self: stretch;
  display: flex;
  align-items: center;
`;

const UnseenDot = styled.div`
  width: 8px;
  height: 8px;

  background-color: ${colors.hyperBlue};
  border-radius: 9999px;
`;

const Container = styled.div<{ isClickable: boolean }>`
  padding: 16px;

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

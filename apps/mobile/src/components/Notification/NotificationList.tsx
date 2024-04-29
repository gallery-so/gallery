import { useFocusEffect } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay';

import { GalleryRefreshControl } from '~/components/GalleryRefreshControl';
import { useAnnouncementContext } from '~/contexts/AnnouncementContext';
import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationListFragment$key } from '~/generated/NotificationListFragment.graphql';
import { NotificationQueryFragment$key } from '~/generated/NotificationQueryFragment.graphql';

import { useMobileClearNotifications } from '../../hooks/useMobileClearNotifications';
import { useRefreshHandle } from '../../hooks/useRefreshHandle';
import { Typography } from '../Typography';
import { NOTIFICATIONS_PER_PAGE } from './constants';
import { Notification } from './Notification';
import AnnouncementNotification from './Notifications/AnnouncementNotification';

type Props = {
  queryRef: NotificationListFragment$key;
};

type NotificationType = {
  id: string;
  notification: NotificationFragment$key;
  query: NotificationQueryFragment$key;
  kind: 'notification';
};

type AnnouncementType = {
  id: string;
  kind: 'announcement';
};

type NotificationListItem = NotificationType | AnnouncementType;

export function NotificationList({ queryRef }: Props) {
  const {
    data: query,
    refetch,
    loadPrevious,
    hasPrevious,
    isLoadingPrevious,
  } = usePaginationFragment(
    graphql`
      fragment NotificationListFragment on Query
      @refetchable(queryName: "NotificationsModalRefetchableQuery") {
        viewer {
          ... on Viewer {
            id

            notifications(last: $notificationsLast, before: $notificationsBefore)
              @connection(key: "NotificationsFragment_notifications") {
              edges {
                node {
                  id
                  __typename
                  ...NotificationFragment
                }
              }
            }
          }
        }

        ...NotificationQueryFragment
      }
    `,
    queryRef
  );

  const { announcement, fetchAnnouncement, hasDismissedAnnouncement } = useAnnouncementContext();

  const clearNotifications = useMobileClearNotifications();
  const { isRefreshing, handleRefresh } = useRefreshHandle(refetch);

  const nonNullNotifications = useMemo(() => {
    const notifications: NotificationListItem[] = [];

    for (const edge of query.viewer?.notifications?.edges ?? []) {
      if (edge?.node) {
        notifications.push({ ...edge.node, notification: edge.node, query, kind: 'notification' });
      }
    }

    if (announcement && announcement.active && !hasDismissedAnnouncement) {
      notifications.push({ id: 'announcement', kind: 'announcement' });
    }

    notifications.reverse();

    return notifications;
  }, [announcement, hasDismissedAnnouncement, query]);

  const loadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(NOTIFICATIONS_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  const renderItem = useCallback<ListRenderItem<NotificationListItem>>(({ item }) => {
    if (item.kind === 'announcement') {
      return <AnnouncementNotification></AnnouncementNotification>;
    }
    return <Notification key={item.id} queryRef={item.query} notificationRef={item.notification} />;
  }, []);

  const handleRefreshAndFetchAnnouncement = useCallback(async () => {
    fetchAnnouncement();
    handleRefresh();
  }, [fetchAnnouncement, handleRefresh]);

  // if user go outside of notifications screen, clear notifications
  useFocusEffect(
    useCallback(() => {
      refetch({}, { fetchPolicy: 'store-and-network' });

      clearNotifications();
    }, [clearNotifications, refetch])
  );

  if (nonNullNotifications.length === 0) {
    return (
      <View className="flex flex-1 items-center justify-center">
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-lg text-black dark:text-white"
        >
          Nothing to see here yet.
        </Typography>
      </View>
    );
  }

  return (
    <FlashList
      data={nonNullNotifications}
      estimatedItemSize={40}
      renderItem={renderItem}
      onEndReached={loadMore}
      refreshing={isLoadingPrevious}
      onEndReachedThreshold={0.8}
      refreshControl={
        <GalleryRefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefreshAndFetchAnnouncement}
        />
      }
    />
  );
}

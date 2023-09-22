import { useFocusEffect } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay';

import { GalleryRefreshControl } from '~/components/GalleryRefreshControl';
import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationListFragment$key } from '~/generated/NotificationListFragment.graphql';
import { NotificationQueryFragment$key } from '~/generated/NotificationQueryFragment.graphql';

import { useMobileClearNotifications } from '../../hooks/useMobileClearNotifications';
import { useRefreshHandle } from '../../hooks/useRefreshHandle';
import { Typography } from '../Typography';
import { NOTIFICATIONS_PER_PAGE } from './constants';
import { Notification } from './Notification';

type Props = {
  queryRef: NotificationListFragment$key;
};

type NotificationType = {
  id: string;
  notification: NotificationFragment$key;
  query: NotificationQueryFragment$key;
};

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

  const clearNotifications = useMobileClearNotifications();
  const { isRefreshing, handleRefresh } = useRefreshHandle(refetch);

  const nonNullNotifications = useMemo(() => {
    const notifications: NotificationType[] = [];

    for (const edge of query.viewer?.notifications?.edges ?? []) {
      if (edge?.node) {
        notifications.push({ ...edge.node, notification: edge.node, query });
      }
    }

    notifications.reverse();

    return notifications;
  }, [query]);

  const loadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(NOTIFICATIONS_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  const renderItem = useCallback<ListRenderItem<NotificationType>>(({ item }) => {
    return <Notification key={item.id} queryRef={item.query} notificationRef={item.notification} />;
  }, []);

  // if user go outside of notifications screen, clear notifications
  useFocusEffect(
    useCallback(() => {
      refetch({});

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
      refreshControl={<GalleryRefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
    />
  );
}

import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';

import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationListFragment$key } from '~/generated/NotificationListFragment.graphql';

import { NOTIFICATIONS_PER_PAGE } from './constants';
import { Notification } from './Notification';

type Props = {
  queryRef: NotificationListFragment$key;
};

type NotificationType = {
  notification: NotificationFragment$key;
};

export function NotificationList({ queryRef }: Props) {
  const {
    data: query,
    loadPrevious,
    hasPrevious,
    isLoadingPrevious,
  } = usePaginationFragment(
    graphql`
      fragment NotificationListFragment on Query
      @refetchable(queryName: "NotificationsModalRefetchableQuery") {
        viewer {
          ... on Viewer {
            notifications(last: $notificationsLast, before: $notificationsBefore)
              @connection(key: "NotificationsFragment_notifications") {
              edges {
                node {
                  ...NotificationFragment
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const nonNullNotifications = useMemo(() => {
    const notifications = [];

    for (const edge of query.viewer?.notifications?.edges ?? []) {
      if (edge?.node) {
        notifications.push({ notification: edge.node });
      }
    }

    notifications.reverse();

    return notifications;
  }, [query.viewer?.notifications?.edges]);

  const loadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(NOTIFICATIONS_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  const renderItem = useCallback<ListRenderItem<NotificationType>>(({ item }) => {
    return <Notification notificationRef={item.notification} />;
  }, []);

  return (
    <FlashList
      data={nonNullNotifications}
      estimatedItemSize={40}
      renderItem={renderItem}
      onEndReached={loadMore}
      refreshing={isLoadingPrevious}
    />
  );
}

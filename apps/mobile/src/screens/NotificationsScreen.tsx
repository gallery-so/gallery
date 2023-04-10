import { Suspense } from 'react';
import { Text, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { NOTIFICATIONS_PER_PAGE } from '~/components/Notification/constants';
import { NotificationList } from '~/components/Notification/NotificationList';
import { Typography } from '~/components/Typography';
import { NotificationsScreenQuery } from '~/generated/NotificationsScreenQuery.graphql';

export function NotificationsScreen() {
  const query = useLazyLoadQuery<NotificationsScreenQuery>(
    graphql`
      query NotificationsScreenQuery($notificationsLast: Int!, $notificationsBefore: String) {
        ...NotificationListFragment
      }
    `,
    {
      notificationsLast: NOTIFICATIONS_PER_PAGE,
      notificationsBefore: null,
    }
  );

  return (
    <Suspense fallback={null}>
      <View className="flex flex-1 ">
        <View className="py-4 px-3">
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-2xl"
          >
            Notifications
          </Typography>
        </View>
        <NotificationList queryRef={query} />
      </View>
    </Suspense>
  );
}

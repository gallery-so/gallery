import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { NOTIFICATIONS_PER_PAGE } from '~/components/Notification/constants';
import { LoadingNotificationList } from '~/components/Notification/LoadingNotificationList';
import { NotificationList } from '~/components/Notification/NotificationList';
import { Typography } from '~/components/Typography';
import { NotificationsScreenQuery } from '~/generated/NotificationsScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

export function NotificationsScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Notifications'>>();

  const query = useLazyLoadQuery<NotificationsScreenQuery>(
    graphql`
      query NotificationsScreenQuery($notificationsLast: Int!, $notificationsBefore: String) {
        ...NotificationListFragment
      }
    `,
    {
      notificationsLast: NOTIFICATIONS_PER_PAGE,
      notificationsBefore: null,
    },
    {
      fetchKey: route.params?.fetchKey,
      fetchPolicy: 'store-and-network',
    }
  );

  return (
    <View className="flex flex-1 bg-white dark:bg-black-900">
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
      <Suspense fallback={<LoadingNotificationList />}>
        <NotificationList queryRef={query} />
      </Suspense>
    </View>
  );
}

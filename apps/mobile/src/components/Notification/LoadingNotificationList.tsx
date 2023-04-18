import { ScrollView } from 'react-native';

import { LoadingNotificationListItem } from './LoadingNotificationListItem';

export function LoadingNotificationList() {
  return (
    <ScrollView className="flex w-full flex-col space-y-2 p-3">
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
      <LoadingNotificationListItem />
    </ScrollView>
  );
}

import { NotificationType } from 'components/NotificationBox/NotificationDropdown';

export function Notification({ notification }: { notification: NotificationType }) {
  if (notification.kind === 'admired') {
    return <></>;
  }

  return null;
}

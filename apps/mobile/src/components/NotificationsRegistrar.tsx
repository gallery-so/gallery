import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';

import { registerNotificationToken } from '../utils/registerNotificationToken';

export function NotificaitonsRegistrar() {
  const relayEnvironment = useRelayEnvironment();

  // Register the notification token when the app starts
  useEffect(() => {
    registerNotificationToken({ shouldPrompt: false, relayEnvironment });
  }, [relayEnvironment]);

  return null;
}

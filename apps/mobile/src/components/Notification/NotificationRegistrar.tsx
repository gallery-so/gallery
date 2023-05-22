import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';

import { registerNotificationToken } from '~/components/Notification/registerNotificationToken';
import { RootStackNavigatorProp } from '~/navigation/types';

import { useMobileClearNotifications } from '../../hooks/useMobileClearNotifications';

export function NotificationRegistrar() {
  const relayEnvironment = useRelayEnvironment();
  const clearNotifications = useMobileClearNotifications();

  useEffect(() => {
    registerNotificationToken({ shouldPrompt: false, relayEnvironment });
  }, [relayEnvironment]);

  const navigation = useNavigation<RootStackNavigatorProp>();
  useEffect(() => {
    const cleanup = Notifications.addNotificationResponseReceivedListener(() => {
      clearNotifications();

      navigation.navigate('MainTabs', {
        screen: 'NotificationsTab',
        params: { screen: 'Notifications', params: { fetchKey: Math.random().toString() } },
      });
    });

    return () => cleanup.remove();
  }, [clearNotifications, navigation]);

  return null;
}

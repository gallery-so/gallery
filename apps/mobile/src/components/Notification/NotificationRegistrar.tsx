import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';

import { registerNotificationToken } from '~/components/Notification/registerNotificationToken';
import { RootStackNavigatorProp } from '~/navigation/types';

export function NotificationRegistrar() {
  const relayEnvironment = useRelayEnvironment();

  useEffect(() => {
    registerNotificationToken({ shouldPrompt: false, relayEnvironment });
  }, [relayEnvironment]);

  const navigation = useNavigation<RootStackNavigatorProp>();
  useEffect(() => {
    const cleanup = Notifications.addNotificationResponseReceivedListener(() => {
      navigation.navigate('MainTabs', {
        screen: 'NotificationsTab',
        params: { screen: 'Notifications', params: { fetchKey: Math.random().toString() } },
      });
    });

    return () => cleanup.remove();
  }, [navigation]);

  return null;
}

import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { NotificationResponse } from 'expo-notifications';
import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';

import { registerNotificationToken } from '~/components/Notification/registerNotificationToken';
import { RootStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import { useMobileClearNotifications } from '../../hooks/useMobileClearNotifications';

export function NotificationRegistrar() {
  const relayEnvironment = useRelayEnvironment();
  const clearNotifications = useMobileClearNotifications();

  useEffect(() => {
    registerNotificationToken({ shouldPrompt: false, relayEnvironment });
  }, [relayEnvironment]);

  const track = useTrack();

  const navigation = useNavigation<RootStackNavigatorProp>();
  useEffect(() => {
    const cleanup = Notifications.addNotificationResponseReceivedListener(
      (event: NotificationResponse) => {
        clearNotifications();

        track('Push Notification Tapped', {
          context: contexts['Push Notifications'],
          actionIdentifier: event?.actionIdentifier,
          userText: event?.userText,
        });

        navigation.navigate('MainTabs', {
          screen: 'NotificationsTab',
          params: { screen: 'Notifications', params: { fetchKey: Math.random().toString() } },
        });
      }
    );

    return () => cleanup.remove();
  }, [clearNotifications, navigation, track]);

  return null;
}

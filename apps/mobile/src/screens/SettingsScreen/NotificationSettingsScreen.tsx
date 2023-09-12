import * as Application from 'expo-application';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, View } from 'react-native';
import { useRelayEnvironment } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { registerNotificationToken } from '~/components/Notification/registerNotificationToken';
import { Typography } from '~/components/Typography';

export function NotificationSettingsScreen() {
  const relayEnvironment = useRelayEnvironment();

  const [pushNotificationPermissions, setPushNotificationPermissions] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);

  const checkPushNotificationPermission = useCallback(async () => {
    const existingPermissions = await Notifications.getPermissionsAsync();
    setPushNotificationPermissions(existingPermissions);
  }, []);

  useEffect(() => {
    checkPushNotificationPermission();
  }, [checkPushNotificationPermission]);

  const handleResyncPushNotifications = useCallback(async () => {
    if (pushNotificationPermissions?.canAskAgain === true) {
      await registerNotificationToken({ shouldPrompt: true, relayEnvironment });
      checkPushNotificationPermission();
    } else {
      Alert.alert(
        'Enable Notifications',
        'You can enable notifications via Settings > Notifications > Gallery Labs',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: () => {
              // This will open the native settings app on iOS. Need to test when we support Android
              Linking.openURL(`App-Prefs:${Application.applicationId}`);
            },
          },
        ]
      );
    }
  }, [checkPushNotificationPermission, pushNotificationPermissions?.canAskAgain, relayEnvironment]);

  const isPushNotificationPermissionGranted = useMemo(
    () => pushNotificationPermissions?.status === 'granted',
    [pushNotificationPermissions]
  );

  return (
    <View className="relative pt-4 flex-1 bg-white dark:bg-black-900">
      <View className="px-4 relative mb-2">
        <BackButton />
      </View>
      <View className="px-4 pt-8 space-y-6 flex flex-col">
        <Typography className="text-xl" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Push notifications
        </Typography>
        {isPushNotificationPermissionGranted ? (
          <Button
            eventElementId="Enable Push Notifications Button (Disabled) in Settings Screen"
            eventName={null}
            variant="disabled"
            text="Push notifications are enabled"
          />
        ) : (
          <Button
            eventElementId="Enable Push Notifications Button in Settings Screen"
            eventName="Enable Push Notifications Button in Settings Screen Pressed"
            text="Enable Push Notifications"
            onPress={handleResyncPushNotifications}
          />
        )}
      </View>
    </View>
  );
}

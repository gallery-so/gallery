import * as Application from 'expo-application';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, View } from 'react-native';
import { useRelayEnvironment } from 'react-relay';
import colors from 'shared/theme/colors';
import { CircleCheckIcon } from 'src/icons/CircleCheckIcon';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { registerNotificationToken } from '~/components/Notification/registerNotificationToken';
import { Toggle } from '~/components/Toggle';
import { Typography } from '~/components/Typography';
import { contexts } from '~/shared/analytics/constants';

export function NotificationSettingsScreen() {
  const relayEnvironment = useRelayEnvironment();

  const [pushNotificationPermissions, setPushNotificationPermissions] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);

  const checkPushNotificationPermission = useCallback(async () => {
    const existingPermissions = await Notifications.getPermissionsAsync();
    setPushNotificationPermissions(existingPermissions);
  }, []);

  const query = { viewer: null };
  const hasEarlyAccess = useMemo(() => {
    return query.viewer?.user?.roles?.includes('EARLY_ACCESS') ?? false;
  }, [query]);

  const emailNotificationSettingData = useMemo(
    () => [
      {
        key: 'notifications',
        title: 'Notifications',
        description: 'Weekly summary of your unread notifications',
      },
      {
        key: 'marketing',
        title: 'General Marketing',
        description: 'Product updates, artist collabs, and airdrops',
      },
      // Conditionally add the 'Members Club' entry if `hasEarlyAccess` is true
      ...(hasEarlyAccess
        ? [
            {
              key: 'membersClub',
              title: 'Members Club',
              description: 'Exclusive updates for Members Club Holders',
            },
          ]
        : []),
      {
        key: 'digest',
        title: 'Digest',
        description: 'Weekly digest of top interacted galleries, artists, and posts',
      },
    ],
    [hasEarlyAccess]
  );

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

  // TODOs:
  // fix row styling
  // add query to get if member's club or not
  // add logic to actually update user settings (copy from web)
  // find out if you need to add the edit button logic
  return (
    <View className="relative pt-4 flex-1 bg-white dark:bg-black-900">
      <View className="px-4 relative mb-2">
        <BackButton />
      </View>
      <View className="px-4 pt-8 space-y-2 flex flex-col">
        <Typography className="text-xl" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Email notifications
        </Typography>
        <Typography className="text-md" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Receive weekly recaps that show your most recent admires, comments, and followers.
        </Typography>
        <View className="p-3 space-y-3 bg-offWhite">
          <View>
            <View className="flex">
              <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
                {'username@email.com'}
              </Typography>
              <View className="flex flex-col justify-between">
                <View className="flex flex-row items-center space-x-1">
                  <CircleCheckIcon stroke={colors.shadow} width="20" height="20" />
                  <Typography
                    className="text-sm text-shadow"
                    font={{ family: 'ABCDiatype', weight: 'Regular' }}
                  >
                    {'verified'}
                  </Typography>
                </View>
                <Button className="w-[80px]" variant="secondary" text="EDIT" onPress={() => {}} />
              </View>
            </View>
          </View>
          <View className="w-full h-px bg-porcelain" />
          <View className="bg-offWhite">
            {emailNotificationSettingData.map((notifSetting) => (
              <View className="space-y-3">
                <View className="flex flex-col">
                  <View className="max-w-[280px]">
                    <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                      {notifSetting.title}
                    </Typography>

                    <Typography
                      className="text-sm"
                      font={{ family: 'ABCDiatype', weight: 'Regular' }}
                    >
                      {notifSetting.description}
                    </Typography>
                  </View>
                  <Toggle checked={true} onToggle={() => {}} />
                </View>
                <View className="w-full h-px mb-3 bg-porcelain" />
              </View>
            ))}
          </View>
        </View>
      </View>
      <View className="px-4 pt-8 space-y-6 flex flex-col">
        <Typography className="text-xl" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Push notifications
        </Typography>
        {isPushNotificationPermissionGranted ? (
          <Button
            eventElementId="Enable Push Notifications Button (Disabled) in Settings Screen"
            eventName={null}
            eventContext={contexts.Settings}
            variant="disabled"
            text="Push notifications are enabled"
          />
        ) : (
          <Button
            eventElementId="Enable Push Notifications Button in Settings Screen"
            eventName="Enable Push Notifications Button in Settings Screen Pressed"
            eventContext={contexts.Settings}
            text="Enable Push Notifications"
            onPress={handleResyncPushNotifications}
          />
        )}
      </View>
    </View>
  );
}

import * as Application from 'expo-application';
import * as Notifications from 'expo-notifications';
import { useColorScheme } from 'nativewind';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, View } from 'react-native';
import { useRelayEnvironment } from 'react-relay';
import { graphql, useLazyLoadQuery } from 'react-relay';
import colors from 'shared/theme/colors';
import { CircleCheckIcon } from 'src/icons/CircleCheckIcon';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { registerNotificationToken } from '~/components/Notification/registerNotificationToken';
import { Toggle } from '~/components/Toggle';
import { Typography } from '~/components/Typography';
import { useToastActions } from '~/contexts/ToastContext';
import { NotificationSettingsScreensQuery } from '~/generated/NotificationSettingsScreensQuery.graphql';
import { contexts } from '~/shared/analytics/constants';
import useUpdateEmailNotificationSettings from '~/shared/hooks/useUpdateEmailNotificationSettings';

export function NotificationSettingsScreen() {
  const query = useLazyLoadQuery<NotificationSettingsScreensQuery>(
    graphql`
      query NotificationSettingsScreensQuery {
        viewer {
          ... on Viewer {
            user {
              roles
            }
            email {
              email
              verificationStatus
              emailNotificationSettings {
                unsubscribedFromNotifications
                unsubscribedFromDigest
                unsubscribedFromMarketing
                unsubscribedFromMembersClub
              }
            }
          }
        }
      }
    `,
    {}
  );
  const relayEnvironment = useRelayEnvironment();

  const [pushNotificationPermissions, setPushNotificationPermissions] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);

  const checkPushNotificationPermission = useCallback(async () => {
    const existingPermissions = await Notifications.getPermissionsAsync();
    setPushNotificationPermissions(existingPermissions);
  }, []);

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

  const userEmail = query?.viewer?.email?.email;

  const isEmailUnverified = useMemo(() => {
    return DISABLED_TOGGLE_BY_EMAIL_STATUS.includes(query?.viewer?.email?.verificationStatus ?? '');
  }, [query]);

  const shouldShowEmailSettings = useMemo(
    () => userEmail && !isEmailUnverified,
    [userEmail, isEmailUnverified]
  );

  const currentEmailNotificationSettings = query?.viewer?.email?.emailNotificationSettings;

  const [emailSettings, setEmailSettings] = useState<EmailNotificationSettings>({
    notifications: !currentEmailNotificationSettings?.unsubscribedFromNotifications,
    marketing: !currentEmailNotificationSettings?.unsubscribedFromMarketing,
    digest: !currentEmailNotificationSettings?.unsubscribedFromDigest,
    membersClub: hasEarlyAccess
      ? !currentEmailNotificationSettings?.unsubscribedFromMembersClub
      : false,
    // currently cannot toggle all notifs from notif setting
    all: false,
  });

  const isToggleChecked = useCallback(
    (notifType: string | number) => {
      // if the user dont have an email or not verified, we want to toggle off
      if (!shouldShowEmailSettings) {
        return false;
      }
      return emailSettings[notifType];
    },
    [shouldShowEmailSettings, emailSettings]
  );
  const { pushToast } = useToastActions();

  const updateEmailNotificationSettings = useUpdateEmailNotificationSettings();

  // Adjusted toggle handler to manage multiple settings
  const handleToggle = async (settingType: string, settingTitle: string) => {
    // Invert the current setting to reflect the change immediately in the UI
    const newSettingValue = !emailSettings[settingType];

    setEmailSettings((prevSettings) => ({
      ...prevSettings,
      [settingType]: newSettingValue,
    }));

    try {
      await handleEmailNotificationChange(settingType, newSettingValue, settingTitle);

      // Assuming success if no errors thrown
      pushToast({
        message: `Settings successfully updated. You have ${
          newSettingValue ? 'subscribed to' : 'unsubscribed from'
        } ${settingTitle}.`,
      });
    } catch (error) {
      // On failure, revert the optimistic UI update to maintain consistency with the server state
      setEmailSettings((prevSettings) => ({
        ...prevSettings,
        [settingType]: !newSettingValue,
      }));

      // Handle and report the error appropriately
      reportError('Failed to update email notification settings');

      pushToast({
        message: 'Unfortunately, there was an error updating your notification settings.',
      });
    }
  };

  const handleEmailNotificationChange = useCallback(
    async (settingType: string, newSettingValue: boolean, settingTitle: string) => {
      // Determine which setting is being updated and its new value
      const settingsUpdate = {
        ...emailSettings, // Assuming emailSettings is a new state that holds all settings
        [settingType]: newSettingValue,
      };

      try {
        // Call the API to update the email notification settings
        // You need to adjust the payload according to your backend requirements
        const response = await updateEmailNotificationSettings({
          unsubscribedFromNotifications: !settingsUpdate.notifications,
          unsubscribedFromDigest: !settingsUpdate.digest,
          unsubscribedFromMarketing: !settingsUpdate.marketing,
          unsubscribedFromMembersClub: !settingsUpdate.membersClub ?? false,
          unsubscribedFromAll: false,
        });

        // Update local state based on the response
        // Assuming response structure is similar, adjust as necessary
        if (
          response.updateEmailNotificationSettings?.viewer?.email?.emailNotificationSettings &&
          settingType in
            response.updateEmailNotificationSettings.viewer.email.emailNotificationSettings
        ) {
          const settings =
            response.updateEmailNotificationSettings.viewer.email.emailNotificationSettings;
          if (settings[settingType as keyof EmailSettings] === newSettingValue) {
            setEmailSettings(settingsUpdate);
            pushToast({
              message: `Settings successfully updated. You will ${
                settingsUpdate[settingType] ? 'no longer' : 'now'
              } receive ${settingTitle} emails.`,
            });
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          reportError('Failed to update email notification settings');
        }
        pushToast({
          message: 'Unfortunately, there was an error updating your notification settings.',
        });
        // No need to explicitly revert the toggle state here if using a centralized state approach
      }
    },
    [
      emailSettings, // Make sure to include this in your dependencies if you're using it
      pushToast,
      updateEmailNotificationSettings,
    ]
  );

  const { colorScheme } = useColorScheme();

  // TODOs:
  // add query to get if member's club or not
  // add verified check to show email setting
  // add logic to actually update user settings (copy from web)
  return (
    <View className="relative pt-4 flex-1 bg-white dark:bg-black-900">
      <View className="px-4 relative mb-2">
        <BackButton />
      </View>
      {shouldShowEmailSettings && (
        <View className="px-4 pt-8 space-y-2 flex flex-col">
          <Typography className="text-xl" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Email notifications
          </Typography>
          <Typography className="text-md" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            Receive weekly recaps that show your most recent admires, comments, and followers.
          </Typography>
          <View className="p-3 space-y-3 bg-offWhite dark:bg-black-700">
            <View>
              <View className="flex">
                <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
                  {'username@email.com'}
                </Typography>
                <View className="flex flex-col justify-between">
                  <View className="flex flex-row items-center space-x-1">
                    <CircleCheckIcon
                      stroke={colorScheme === 'dark' ? colors.metal : colors.shadow}
                      width="20"
                      height="20"
                    />
                    <Typography
                      className="text-sm text-shadow dark:text-metal"
                      font={{ family: 'ABCDiatype', weight: 'Regular' }}
                    >
                      Verified
                    </Typography>
                  </View>
                </View>
              </View>
            </View>
            <View className="bg-offWhite dark:bg-black-700">
              {emailNotificationSettingData.map((notifSetting, idx) => (
                <View className="space-y-3" key={idx}>
                  <View className="w-full h-px bg-porcelain dark:bg-shadow" />
                  <View className="flex flex-row justify-between items-center">
                    <View className="max-w-[280px] mb-3">
                      <Typography
                        className="text-sm"
                        font={{ family: 'ABCDiatype', weight: 'Bold' }}
                      >
                        {notifSetting.title}
                      </Typography>
                      <Typography
                        className="text-sm"
                        font={{ family: 'ABCDiatype', weight: 'Regular' }}
                      >
                        {notifSetting.description}
                      </Typography>
                    </View>
                    <Toggle
                      checked={isToggleChecked(notifSetting.key) ?? false}
                      onToggle={() => handleToggle(notifSetting.key, notifSetting.title)}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
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

const DISABLED_TOGGLE_BY_EMAIL_STATUS = ['Unverified', 'Failed'];

type EmailSettings = {
  readonly unsubscribedFromAll: boolean;
  readonly unsubscribedFromDigest: boolean;
  readonly unsubscribedFromMarketing: boolean;
  readonly unsubscribedFromMembersClub: boolean;
  readonly unsubscribedFromNotifications: boolean;
};

type EmailNotificationSettings = {
  notifications: boolean;
  marketing: boolean;
  digest: boolean;
  membersClub: boolean;
  all: boolean;
  [key: string]: boolean;
};

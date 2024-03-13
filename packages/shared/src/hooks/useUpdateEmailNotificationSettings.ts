import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useUpdateEmailNotificationSettingsFragment$key } from '~/generated/useUpdateEmailNotificationSettingsFragment.graphql';
import { useUpdateEmailNotificationSettingsMutation } from '~/generated/useUpdateEmailNotificationSettingsMutation.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

type useUpdateEmailNotificationSettingsProps = {
  queryRef: useUpdateEmailNotificationSettingsFragment$key;
  hasEarlyAccess: boolean;
  shouldShowEmailSettings: boolean;
};

export default function useUpdateEmailNotificationSettings({
  queryRef,
  hasEarlyAccess,
  shouldShowEmailSettings,
}: useUpdateEmailNotificationSettingsProps) {
  const query = useFragment(
    graphql`
      fragment useUpdateEmailNotificationSettingsFragment on Query {
        viewer {
          ... on Viewer {
            email {
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
    queryRef
  );

  const currentEmailNotificationSettings = query?.viewer?.email?.emailNotificationSettings;

  const [emailSettings, setEmailSettings] = useState<EmailNotificationSettings>({
    unsubscribedFromNotifications:
      currentEmailNotificationSettings?.unsubscribedFromNotifications ?? false,
    unsubscribedFromMarketing: currentEmailNotificationSettings?.unsubscribedFromMarketing ?? false,
    unsubscribedFromDigest: currentEmailNotificationSettings?.unsubscribedFromDigest ?? false,
    unsubscribedFromMembersClub: hasEarlyAccess
      ? Boolean(currentEmailNotificationSettings?.unsubscribedFromMembersClub)
      : false,
    // currently cannot toggle all notifs from notif setting
    unsubscribedFromAll: false,
  });

  const computeToggleChecked = useCallback(
    (notifType: keyof EmailNotificationSettings) => {
      // if the user dont have an email or not verified, we want to toggle off
      if (!shouldShowEmailSettings) {
        return false;
      }
      return emailSettings[notifType];
    },
    [shouldShowEmailSettings, emailSettings]
  );

  const [updateEmailNotificationSettingsMutation] =
    usePromisifiedMutation<useUpdateEmailNotificationSettingsMutation>(graphql`
      mutation useUpdateEmailNotificationSettingsMutation(
        $enabledNotification: UpdateEmailNotificationSettingsInput!
      ) @raw_response_type {
        updateEmailNotificationSettings(input: $enabledNotification) {
          ... on UpdateEmailNotificationSettingsPayload {
            viewer {
              email {
                emailNotificationSettings {
                  unsubscribedFromNotifications
                  unsubscribedFromDigest
                  unsubscribedFromMarketing
                  unsubscribedFromMembersClub
                  unsubscribedFromAll
                }
              }
            }
          }
          ... on ErrInvalidInput {
            __typename
          }
        }
      }
    `);

  const updateEmailNotificationSettings = useCallback(
    ({
      unsubscribedFromNotifications,
      unsubscribedFromDigest,
      unsubscribedFromMarketing,
      unsubscribedFromMembersClub,
      unsubscribedFromAll,
    }: EmailNotificationSettings) => {
      return updateEmailNotificationSettingsMutation({
        variables: {
          enabledNotification: {
            unsubscribedFromNotifications,
            unsubscribedFromDigest,
            unsubscribedFromMarketing,
            unsubscribedFromMembersClub,
            unsubscribedFromAll,
          },
        },
      });
    },
    [updateEmailNotificationSettingsMutation]
  );

  const handleEmailNotificationChange = useCallback(
    async ({
      settingType,
      newSettingValue,
      settingTitle,
      pushToast,
    }: handleEmailNotificationChangeProps) => {
      const settingsUpdate: EmailNotificationSettings = {
        ...emailSettings,
        [settingType]: newSettingValue,
      };

      try {
        const response = await updateEmailNotificationSettings({
          unsubscribedFromNotifications: settingsUpdate.unsubscribedFromNotifications,
          unsubscribedFromDigest: settingsUpdate.unsubscribedFromDigest,
          unsubscribedFromMarketing: settingsUpdate.unsubscribedFromMarketing,
          unsubscribedFromMembersClub: settingsUpdate.unsubscribedFromMembersClub ?? false,
          unsubscribedFromAll: false,
        });

        if (
          response.updateEmailNotificationSettings?.viewer?.email?.emailNotificationSettings &&
          settingType in
            response.updateEmailNotificationSettings.viewer.email.emailNotificationSettings
        ) {
          const settings = response.updateEmailNotificationSettings.viewer.email
            .emailNotificationSettings as EmailNotificationSettings;
          if (settings[settingType] === newSettingValue) {
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
      }
    },
    [emailSettings, updateEmailNotificationSettings]
  );

  const handleToggle = useCallback(
    async ({ settingType, settingTitle, pushToast }: handleToggleProps) => {
      const newSettingValue = !emailSettings[settingType];

      setEmailSettings((prevSettings) => ({
        ...prevSettings,
        [settingType]: newSettingValue,
      }));

      try {
        await handleEmailNotificationChange({
          settingType,
          newSettingValue,
          settingTitle,
          pushToast,
        });

        pushToast({
          message: `Settings successfully updated. You have ${
            newSettingValue ? 'subscribed to' : 'unsubscribed from'
          } ${settingTitle}.`,
        });
      } catch (error) {
        setEmailSettings((prevSettings) => ({
          ...prevSettings,
          [settingType]: !newSettingValue,
        }));

        reportError('Failed to update email notification settings');

        pushToast({
          message: 'Unfortunately, there was an error updating your notification settings.',
        });
      }
    },
    [emailSettings, handleEmailNotificationChange]
  );

  return useMemo(
    () => ({
      emailSettings,
      computeToggleChecked,
      handleToggle,
    }),
    [emailSettings, computeToggleChecked, handleToggle]
  );
}

export type EmailNotificationSettings = {
  unsubscribedFromAll: boolean;
  unsubscribedFromDigest: boolean;
  unsubscribedFromMarketing: boolean;
  unsubscribedFromMembersClub: boolean;
  unsubscribedFromNotifications: boolean;
};

type handleToggleProps = {
  settingType: keyof EmailNotificationSettings;
  settingTitle: string;
  pushToast: ({ message }: { message: string }) => void;
};

type handleEmailNotificationChangeProps = handleToggleProps & { newSettingValue: boolean };

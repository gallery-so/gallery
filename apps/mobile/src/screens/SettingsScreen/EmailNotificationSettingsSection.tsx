import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import colors from 'shared/theme/colors';
import { CircleCheckIcon } from 'src/icons/CircleCheckIcon';

import { Toggle } from '~/components/Toggle';
import { Typography } from '~/components/Typography';
import { useToastActions } from '~/contexts/ToastContext';
import { EmailNotificationSettingsSectionQuery } from '~/generated/EmailNotificationSettingsSectionQuery.graphql';
import useUpdateEmailNotificationSettings, {
  EmailNotificationSettings,
} from '~/shared/hooks/useUpdateEmailNotificationSettings';

export function EmailNotificationSettingsSection() {
  const query = useLazyLoadQuery<EmailNotificationSettingsSectionQuery>(
    graphql`
      query EmailNotificationSettingsSectionQuery {
        viewer {
          ... on Viewer {
            email {
              email
              verificationStatus
            }
          }
        }
        ...useUpdateEmailNotificationSettingsFragment
      }
    `,
    {}
  );

  const userEmail = query?.viewer?.email?.email;
  const { pushToast } = useToastActions();
  const { colorScheme } = useColorScheme();

  const isEmailUnverified = useMemo(() => {
    return DISABLED_TOGGLE_BY_EMAIL_STATUS.includes(query?.viewer?.email?.verificationStatus ?? '');
  }, [query]);

  const shouldShowEmailSettings = useMemo(
    () => userEmail && !isEmailUnverified,
    [userEmail, isEmailUnverified]
  );

  const { emailNotificationSettingData, computeToggleChecked, handleToggle } =
    useUpdateEmailNotificationSettings({
      queryRef: query,
      shouldShowEmailSettings: Boolean(shouldShowEmailSettings),
    });

  if (!shouldShowEmailSettings) {
    return null;
  }

  return (
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
              {userEmail}
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
              <View className="w-full h-px bg-porcelain dark:bg-black-500" />
              <View className="flex flex-row justify-between items-center">
                <View className="max-w-[280px] mb-3">
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
                <Toggle
                  checked={
                    computeToggleChecked(notifSetting.key as keyof EmailNotificationSettings) ??
                    false
                  }
                  onToggle={() =>
                    handleToggle({
                      settingType: notifSetting.key as keyof EmailNotificationSettings,
                      settingTitle: notifSetting.title,
                      pushToast,
                    })
                  }
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const DISABLED_TOGGLE_BY_EMAIL_STATUS = ['Unverified', 'Failed'];

import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import Toggle from '~/components/core/Toggle/Toggle';
import EmailManager from '~/components/Email/EmailManager';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { ManageEmailSectionFragment$key } from '~/generated/ManageEmailSectionFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import useUpdateEmailNotificationSettings from '~/shared/hooks/useUpdateEmailNotificationSettings';
import colors from '~/shared/theme/colors';

import SettingsRowDescription from '../SettingsRowDescription';

type Props = {
  queryRef: ManageEmailSectionFragment$key;
};

const SettingsRowTitle = styled(BaseM)`
  max-width: 380px;
`;

export default function ManageEmailSection({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ManageEmailSectionFragment on Query {
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

        ...EmailManagerFragment
      }
    `,
    queryRef
  );

  const userEmail = query?.viewer?.email?.email;

  const updateEmailNotificationSettings = useUpdateEmailNotificationSettings();

  const currentEmailNotificationSettings = query?.viewer?.email?.emailNotificationSettings;

  const hasEarlyAccess = useMemo(() => {
    return query.viewer?.user?.roles?.includes('EARLY_ACCESS');
  }, [query]);

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

  const emailNotificationSettingData = useMemo(
    () => [
      {
        key: 'notifications',
        title: 'Notifications',
        description: 'Notification summary emails',
      },
      {
        key: 'marketing',
        title: 'General Marketing',
        description: 'Product marketing emails',
      },
      // Conditionally add the 'Members Club' entry if `hasEarlyAccess` is true
      ...(hasEarlyAccess
        ? [
            {
              key: 'membersClub',
              title: 'Members Club',
              description: 'Exclusively for Members Club Holders',
            },
          ]
        : []),
      {
        key: 'digest',
        title: 'Weekly Digest',
        description: 'Featured Galleries, Collections and more',
      },
    ],
    [hasEarlyAccess]
  );

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
  };

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const [shouldDisplayAddEmailInput, setShouldDisplayAddEmailInput] = useState<boolean>(
    Boolean(userEmail)
  );

  const [isPending, setIsPending] = useState<EmailNotificationSettings>({
    notifications: false,
    marketing: false,
    digest: false,
    membersClub: false,
    all: false,
  });

  const handleEmailNotificationChange = useCallback(
    async (settingType: string, newSettingValue: boolean, settingTitle: string) => {
      const settingsUpdate = {
        ...emailSettings,
        [settingType]: newSettingValue,
      };

      setIsPending((prev) => ({ ...prev, [settingType]: true }));
      try {
        const response = await updateEmailNotificationSettings({
          unsubscribedFromNotifications: !settingsUpdate.notifications,
          unsubscribedFromDigest: !settingsUpdate.digest,
          unsubscribedFromMarketing: !settingsUpdate.marketing,
          unsubscribedFromMembersClub: !settingsUpdate.membersClub ?? false,
          unsubscribedFromAll: false,
        });

        // Update local state based on the response and push toast on success
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
      } finally {
        setIsPending((prev) => ({ ...prev, [settingType]: false }));
      }
    },
    [emailSettings, pushToast, reportError, updateEmailNotificationSettings]
  );

  const handleOpenEmailManager = useCallback(() => {
    setShouldDisplayAddEmailInput(true);
  }, []);

  const handleCloseEmailManager = useCallback(() => {
    if (!userEmail) {
      setShouldDisplayAddEmailInput(false);
    }
  }, [userEmail]);

  const isEmailUnverified = useMemo(() => {
    return DISABLED_TOGGLE_BY_EMAIL_STATUS.includes(query?.viewer?.email?.verificationStatus ?? '');
  }, [query]);

  const isToggleChecked = useCallback(
    (notifType: string | number) => {
      // if the user dont have an email or not verified, we want to toggle off
      if (!userEmail || isEmailUnverified) {
        return false;
      }
      return emailSettings[notifType];
    },
    [isEmailUnverified, userEmail, emailSettings]
  );

  return (
    <VStack gap={16}>
      <VStack>
        <TitleDiatypeL>Email Notifications</TitleDiatypeL>
        <HStack justify="space-between" align="center">
          <SettingsRowDescription>
            Receive weekly recaps about product updates, airdrop opportunities, and your most recent
            gallery admirers.
          </SettingsRowDescription>
        </HStack>
      </VStack>
      <StyledButtonContainer gap={12}>
        {shouldDisplayAddEmailInput ? (
          <EmailManager queryRef={query} onClose={handleCloseEmailManager} />
        ) : (
          <StyledButton
            eventElementId="Begin Add Email Address Button"
            eventName="Begin Add Email Address"
            eventContext={contexts.Email}
            variant="secondary"
            onClick={handleOpenEmailManager}
          >
            add email address
          </StyledButton>
        )}
        <VStack gap={14}>
          {emailNotificationSettingData.map((emailNotifSetting, idx) => (
            <>
              <Divider />
              <HStack justify="space-between" align="center" key={idx} gap={6}>
                <VStack>
                  <strong>
                    <SettingsRowTitle>{emailNotifSetting.title}</SettingsRowTitle>
                  </strong>
                  <SettingsRowDescription>{emailNotifSetting.description}</SettingsRowDescription>
                </VStack>
                <Toggle
                  checked={isToggleChecked(emailNotifSetting.key) ?? false}
                  isPending={isPending[emailNotifSetting.key] || isEmailUnverified}
                  onChange={() => handleToggle(emailNotifSetting.key, emailNotifSetting.title)}
                />
              </HStack>
            </>
          ))}
        </VStack>
      </StyledButtonContainer>
    </VStack>
  );
}

const StyledButtonContainer = styled(VStack)`
  background-color: ${colors.faint};

  padding: 12px;
`;

const StyledButton = styled(Button)`
  padding: 8px 12px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${colors.porcelain};
`;

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

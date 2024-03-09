import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import Toggle from '~/components/core/Toggle/Toggle';
import EmailManager from '~/components/Email/EmailManager';
import useUpdateEmailNotificationSettings from '~/components/Email/useUpdateEmailNotificationSettings';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { ManageEmailSectionFragment$key } from '~/generated/ManageEmailSectionFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import colors from '~/shared/theme/colors';

import SettingsRowDescription from '../SettingsRowDescription';

type Props = {
  queryRef: ManageEmailSectionFragment$key;
};

const SettingsRowTitle = styled(BaseM)`
  max-width: 380px;
`;

const DISABLED_TOGGLE_BY_EMAIL_STATUS = ['Unverified', 'Failed'];

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
                unsubscribedFromAll
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

  const [emailSettings, setEmailSettings] = useState({
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

  // Adjusted toggle handler to manage multiple settings
  const handleToggle = async (settingType) => {
    // Invert the current setting to reflect the change immediately in the UI
    const newSettingValue = !emailSettings[settingType];

    setEmailSettings((prevSettings) => ({
      ...prevSettings,
      [settingType]: newSettingValue,
    }));

    try {
      await handleEmailNotificationChange(settingType, newSettingValue);

      // Assuming success if no errors thrown
      pushToast({
        message: `Settings successfully updated. You have ${
          newSettingValue ? 'subscribed to' : 'unsubscribed from'
        } ${settingType}.`,
      });
    } catch (error) {
      // On failure, revert the optimistic UI update to maintain consistency with the server state
      setEmailSettings((prevSettings) => ({
        ...prevSettings,
        [settingType]: !newSettingValue,
      }));

      // Handle and report the error appropriately
      reportError('Failed to update email notification settings', error.message);

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

  const [isPending, setIsPending] = useState({
    notifications: false,
    marketing: false,
    digest: false,
    membersClub: false,
    // Add other settings as needed
  });
  const handleEmailNotificationChange = useCallback(
    async (settingType, newSettingValue) => {
      // Determine which setting is being updated and its new value
      const settingsUpdate = {
        ...emailSettings, // Assuming emailSettings is a new state that holds all settings
        [settingType]: newSettingValue,
      };

      setIsPending((prev) => ({ ...prev, [settingType]: true }));
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
          response.updateEmailNotificationSettings?.viewer?.email?.emailNotificationSettings[
            settingType
          ] === newSettingValue
        ) {
          setEmailSettings(settingsUpdate);
          pushToast({
            message: `Settings successfully updated. You will ${
              settingsUpdate[settingType] ? 'no longer' : 'now'
            } receive ${settingsUpdate[settingType].label} emails.`,
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          reportError('Failed to update email notification settings', error.message);
        }
        pushToast({
          message: 'Unfortunately, there was an error updating your notification settings.',
        });
        // No need to explicitly revert the toggle state here if using a centralized state approach
      } finally {
        setIsPending(false);
      }
    },
    [
      emailSettings, // Make sure to include this in your dependencies if you're using it
      pushToast,
      reportError,
      updateEmailNotificationSettings,
    ]
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
    (notifType) => {
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
                  checked={isToggleChecked(emailNotifSetting.key)}
                  isPending={isPending[emailNotifSetting.key]}
                  onChange={() => handleToggle(emailNotifSetting.key)}
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

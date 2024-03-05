import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
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

const DISABLED_TOGGLE_BY_EMAIL_STATUS = ['Unverified', 'Failed'];

export default function ManageEmailSection({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ManageEmailSectionFragment on Query {
        viewer {
          ... on Viewer {
            email {
              email
              verificationStatus
              emailNotificationSettings {
                unsubscribedFromNotifications
                unsubscribedFromDigest
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

  const isEmailNotificationSubscribed =
    !currentEmailNotificationSettings?.unsubscribedFromNotifications;

  const [isEmailNotificationChecked, setIsEmailNotificationChecked] = useState<boolean>(
    isEmailNotificationSubscribed
  );
  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const isEmailUnsubscribedFromAll = currentEmailNotificationSettings?.unsubscribedFromAll ?? false;
  const isEmailUnsubscribedFromDigest =
    currentEmailNotificationSettings?.unsubscribedFromDigest ?? false;

  const [shouldDisplayAddEmailInput, setShouldDisplayAddEmailInput] = useState<boolean>(
    Boolean(userEmail)
  );

  const [isPending, setIsPending] = useState(false);

  const handleEmailNotificationChange = useCallback(
    async (checked: boolean) => {
      const unsubscribedFromNotifications = checked;
      setIsEmailNotificationChecked(!checked);
      setIsPending(true);
      try {
        const response = await updateEmailNotificationSettings({
          unsubscribedFromNotifications,
          unsubscribedFromDigest: isEmailUnsubscribedFromDigest,
          unsubscribedFromAll: isEmailUnsubscribedFromAll,
        });

        if (
          response.updateEmailNotificationSettings?.viewer?.email?.emailNotificationSettings
            ?.unsubscribedFromNotifications
        ) {
          pushToast({
            message:
              'Settings successfully updated. You will no longer receive notification emails',
          });
          return;
        }
        pushToast({
          message: 'Settings successfully updated. You will now receive notification emails',
        });
        return;
      } catch (error) {
        if (error instanceof Error) {
          reportError('Failed to update email notification settings');
        }
        pushToast({
          message: 'Unfortunately there was an error to update your notification settings',
        });
        // If its failed, revert the toggle state
        setIsEmailNotificationChecked(checked);
      } finally {
        setIsPending(false);
      }
    },
    [
      isEmailUnsubscribedFromAll,
      isEmailUnsubscribedFromDigest,
      pushToast,
      reportError,
      updateEmailNotificationSettings,
    ]
  );

  const toggleEmailNotification = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleEmailNotificationChange(!event.target.checked);
    },
    [handleEmailNotificationChange]
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

  const isToggleChecked = useMemo(() => {
    // if the user dont have an email or not verified, we want to toggle off
    if (!userEmail || isEmailUnverified) {
      return false;
    }
    setIsEmailNotificationChecked(isEmailNotificationSubscribed);
    return isEmailNotificationChecked;
  }, [isEmailNotificationChecked, isEmailNotificationSubscribed, isEmailUnverified, userEmail]);

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
        <Divider />
        <HStack justify="space-between" align="center">
          <strong>
            <SettingsRowDescription>Receive weekly recaps</SettingsRowDescription>
          </strong>
          <Toggle
            checked={isToggleChecked}
            isPending={isPending || isEmailUnverified}
            onChange={toggleEmailNotification}
          />
        </HStack>
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

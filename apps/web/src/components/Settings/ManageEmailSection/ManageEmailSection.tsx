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
import useUpdateEmailNotificationSettings, {
  EmailNotificationSettings,
} from '~/shared/hooks/useUpdateEmailNotificationSettings';
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
            email {
              email
              verificationStatus
            }
          }
        }

        ...EmailManagerFragment
        ...useUpdateEmailNotificationSettingsFragment
      }
    `,
    queryRef
  );

  const userEmail = query?.viewer?.email?.email;

  const { pushToast } = useToastActions();

  const [shouldDisplayAddEmailInput, setShouldDisplayAddEmailInput] = useState<boolean>(
    Boolean(userEmail)
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

  const shouldShowEmailSettings = useMemo(
    () => userEmail && !isEmailUnverified,
    [userEmail, isEmailUnverified]
  );

  const { emailNotificationSettingData, computeToggleChecked, handleToggle } =
    useUpdateEmailNotificationSettings({
      queryRef: query,
      shouldShowEmailSettings: Boolean(shouldShowEmailSettings),
    });

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
                  checked={
                    computeToggleChecked(
                      emailNotifSetting.key as keyof EmailNotificationSettings
                    ) ?? false
                  }
                  onChange={() =>
                    handleToggle({
                      settingType: emailNotifSetting.key as keyof EmailNotificationSettings,
                      settingTitle: emailNotifSetting.title,
                      pushToast,
                    })
                  }
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

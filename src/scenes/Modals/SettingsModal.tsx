import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL, TitleDiatypeM } from '~/components/core/Text/Text';
import Toggle from '~/components/core/Toggle/Toggle';
import EmailManager from '~/components/Email/EmailManager';
import ManageWallets from '~/components/ManageWallets/ManageWallets';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { SettingsModalFragment$key } from '~/generated/SettingsModalFragment.graphql';

import useUpdateEmailNotificationSettings from '../../components/Email/useUpdateEmailNotificationSettings';

type Props = {
  queryRef: SettingsModalFragment$key;
  newAddress?: string;
  onEthAddWalletSuccess?: () => void;
  onTezosAddWalletSuccess?: () => void;
};

function SettingsModal({
  newAddress,
  queryRef,
  onEthAddWalletSuccess,
  onTezosAddWalletSuccess,
}: Props) {
  const query = useFragment(
    graphql`
      fragment SettingsModalFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            email @required(action: THROW) {
              email
              verificationStatus
              emailNotificationSettings {
                unsubscribedFromAll
                unsubscribedFromNotifications
              }
            }
          }
        }

        ...EmailManagerFragment
        ...ManageWalletsFragment
      }
    `,
    queryRef
  );

  const updateEmailNotificationSettings = useUpdateEmailNotificationSettings();

  const isEmailNotificationSubscribed =
    !query?.viewer?.email?.emailNotificationSettings?.unsubscribedFromNotifications;

  const [isEmailNotificationChecked, setIsEmailNotificationChecked] = useState<boolean>(
    isEmailNotificationSubscribed
  );
  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const isEmailUnsubscribedFromAll =
    query?.viewer?.email?.emailNotificationSettings?.unsubscribedFromAll ?? false;

  const userEmail = query?.viewer?.email?.email;
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
        const response = await updateEmailNotificationSettings(
          unsubscribedFromNotifications,
          isEmailUnsubscribedFromAll
        );

        if (!response?.updateEmailNotificationSettings) {
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
    [isEmailUnsubscribedFromAll, pushToast, reportError, updateEmailNotificationSettings]
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

  return (
    <StyledManageWalletsModal gap={24}>
      <VStack gap={16}>
        <TitleDiatypeL>Never miss a moment</TitleDiatypeL>
        <VStack>
          <TitleDiatypeM>Email notifications</TitleDiatypeM>
          <HStack>
            <BaseM>
              Receive weekly recaps that show your most recent admires, comments, and followers.
            </BaseM>
            <Toggle
              checked={isEmailNotificationChecked}
              isPending={isPending}
              onChange={toggleEmailNotification}
            />
          </HStack>
        </VStack>
        <StyledButtonContainer>
          {shouldDisplayAddEmailInput ? (
            <EmailManager queryRef={query} onClose={handleCloseEmailManager} />
          ) : (
            <StyledButton variant="secondary" onClick={handleOpenEmailManager}>
              add email address
            </StyledButton>
          )}
        </StyledButtonContainer>
      </VStack>
      <StyledHr />
      <VStack>
        <TitleDiatypeL>Manage Accounts</TitleDiatypeL>
        <ManageWallets
          queryRef={query}
          newAddress={newAddress}
          onTezosAddWalletSuccess={onTezosAddWalletSuccess}
          onEthAddWalletSuccess={onEthAddWalletSuccess}
        />
      </VStack>
    </StyledManageWalletsModal>
  );
}

const StyledManageWalletsModal = styled(VStack)`
  width: 300px;

  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;

const StyledHr = styled.hr`
  width: 100%;
  border-top: 1px solid #e5e5e5;
  margin: 0;
`;

const StyledButtonContainer = styled.div`
  display: inline;
`;

const StyledButton = styled(Button)`
  padding: 8px 12px;
`;

export default SettingsModal;

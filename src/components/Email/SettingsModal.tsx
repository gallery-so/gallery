import { useCallback, useEffect, useState } from 'react';
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

import useUpdateEmailNotificationSettings from './useUpdateEmailNotificationSettings';

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
  const [isEmailNotificationChecked, setIsEmailNotificationChecked] = useState(false);
  const [shouldDisplayAddEmailInput, setShouldDisplayAddEmailInput] = useState(false);
  const { pushToast } = useToastActions();
  const reportError = useReportError();

  // Invert the value since in the db stored as unsubscribe while in the UI it's subscribe
  const isEmailNotificationSubscribed =
    query?.viewer?.email?.emailNotificationSettings?.unsubscribedFromNotifications || false;

  const isEmailUnsubscribedFromAll =
    !!query?.viewer?.email?.emailNotificationSettings?.unsubscribedFromAll ?? false;

  // Set the initial state of the email notification toggle
  // so we can instantly toggle it on/off without waiting for the mutation to complete
  useEffect(() => {
    setIsEmailNotificationChecked(isEmailNotificationSubscribed);
  }, [isEmailNotificationSubscribed]);

  // If the user already have email attached, toggle the email manager ui
  const userEmail = query?.viewer?.email?.email;
  useEffect(() => {
    setShouldDisplayAddEmailInput(Boolean(userEmail));
  }, [userEmail]);

  const [isPending, setIsPending] = useState(false);

  const handleEmailNotificationChange = useCallback(
    async (checked: boolean) => {
      const unsubscribedFromNotifications = !checked;
      setIsEmailNotificationChecked(checked);
      setIsPending(true);
      try {
        const response = await updateEmailNotificationSettings(
          unsubscribedFromNotifications,
          isEmailUnsubscribedFromAll
        );

        // If its failed, revert the toggle state
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

        setIsEmailNotificationChecked(!checked);
      } finally {
        setIsPending(false);
      }
    },
    [isEmailUnsubscribedFromAll, pushToast, reportError, updateEmailNotificationSettings]
  );

  const toggleEmailNotification = useCallback(() => {
    // Invert the value from subscribe to unsubscribe
    handleEmailNotificationChange(!isEmailNotificationChecked);
  }, [handleEmailNotificationChange, isEmailNotificationChecked]);

  const handleOpenEmailManager = useCallback(() => {
    setShouldDisplayAddEmailInput(true);
  }, []);

  const handleCloseEmailManager = useCallback(() => {
    setShouldDisplayAddEmailInput(false);
  }, []);

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
        <StyledButtonContaienr>
          {shouldDisplayAddEmailInput ? (
            <EmailManager queryRef={query} onClose={handleCloseEmailManager} />
          ) : (
            <StyledButton variant="secondary" onClick={handleOpenEmailManager}>
              add email address
            </StyledButton>
          )}
        </StyledButtonContaienr>
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

const StyledButtonContaienr = styled.div`
  display: inline;
`;

const StyledButton = styled(Button)`
  padding: 8px 12px;
`;

export default SettingsModal;

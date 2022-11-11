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
import { ManageWalletModalWithEmailFragment$key } from '~/generated/ManageWalletModalWithEmailFragment.graphql';

import useUpdateEmailNotificationSettings from './useUpdateEmailNotificationSettings';

type Props = {
  queryRef: ManageWalletModalWithEmailFragment$key;
  newAddress?: string;
  onEthAddWalletSuccess?: () => void;
  onTezosAddWalletSuccess?: () => void;
};

function ManageWalletsModalWithEmail({
  newAddress,
  queryRef,
  onEthAddWalletSuccess,
  onTezosAddWalletSuccess,
}: Props) {
  const query = useFragment(
    graphql`
      fragment ManageWalletModalWithEmailFragment on Query {
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
  const [isShowAddEmail, setIsShowAddEmail] = useState(false);
  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const isEmailNotificationUnsubscribed =
    query?.viewer?.email?.emailNotificationSettings?.unsubscribedFromNotifications ?? false;

  // Set the initial state of the email notification toggle
  // so we can instantly toggle it on/off without waiting for the mutation to complete
  useEffect(() => {
    setIsEmailNotificationChecked(!isEmailNotificationUnsubscribed);
  }, [isEmailNotificationUnsubscribed]);

  // If the user already have email attached, toggle the email manager ui
  const userEmail = query?.viewer?.email?.email;
  useEffect(() => {
    setIsShowAddEmail(Boolean(userEmail));
  }, [userEmail]);

  // TODO: Check it again after update notication setting deployed
  const [isPending, setIsPending] = useState(false);

  const handleEmailNotificationChange = useCallback(
    async (checked: boolean) => {
      setIsPending(true);
      try {
        setIsEmailNotificationChecked(checked);
        const response = await updateEmailNotificationSettings(checked);
        // If its failed, revert the toggle state
        if (!response?.updateEmailNotificationSettings) {
          setIsEmailNotificationChecked(!checked);
          pushToast({
            message: 'Settings successfully updated. You will now receive notification emails',
          });
          return;
        }
        pushToast({
          message: 'Settings successfully updated. You will no longer receive notification emails',
        });
      } catch (error) {
        if (error instanceof Error) {
          reportError('Failed to update email notification settings');
        }
        setIsEmailNotificationChecked(!checked);
      } finally {
        setIsPending(false);
      }
    },
    [pushToast, reportError, updateEmailNotificationSettings]
  );

  const toggleEmailNotification = useCallback(() => {
    handleEmailNotificationChange(!isEmailNotificationChecked);
  }, [handleEmailNotificationChange, isEmailNotificationChecked]);

  const handleAddEmail = () => {
    setIsShowAddEmail(true);
  };

  const handleCloseEmailManager = () => {
    setIsShowAddEmail(false);
  };

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
          {isShowAddEmail ? (
            <EmailManager queryRef={query} onClosed={handleCloseEmailManager} />
          ) : (
            <StyledButton variant="secondary" onClick={handleAddEmail}>
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

export default ManageWalletsModalWithEmail;

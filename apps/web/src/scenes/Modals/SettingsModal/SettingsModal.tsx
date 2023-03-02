import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import Toggle from '~/components/core/Toggle/Toggle';
import EmailManager from '~/components/Email/EmailManager';
import ManageWallets from '~/components/ManageWallets/ManageWallets';
import TwitterSetting from '~/components/Twitter/TwitterSetting';
import { GALLERY_DISCORD } from '~/constants/urls';
import { useAuthActions } from '~/contexts/auth/AuthContext';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { SettingsModalFragment$key } from '~/generated/SettingsModalFragment.graphql';
import CircleCheckIcon from '~/icons/CircleCheckIcon';
import { GALLERY_OS_ADDRESS } from '~/utils/getOpenseaExternalUrl';

import useUpdateEmailNotificationSettings from '../../../components/Email/useUpdateEmailNotificationSettings';
import SettingsRowDescription from './SettingsRowDescription';

type Props = {
  queryRef: SettingsModalFragment$key;
  newAddress?: string;
  onEthAddWalletSuccess?: () => void;
  onTezosAddWalletSuccess?: () => void;
};

const DISABLED_TOGGLE_BY_EMAIL_STATUS = ['Unverified', 'Failed'];

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
            user {
              roles
            }
          }
        }

        ...EmailManagerFragment
        ...ManageWalletsFragment
        ...TwitterSettingFragment
      }
    `,
    queryRef
  );

  // drop settings param from URL once modal has been opened
  const { pathname, query: urlQuery, replace } = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(urlQuery as Record<string, string>);
    if (params.has('settings')) {
      params.delete('settings');
      // @ts-expect-error we're simply replacing the current page with the same path
      replace({ pathname, query: params.toString() }, undefined, { shallow: true });
    }
  }, [pathname, replace, urlQuery]);

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

  const hasEarlyAccess = useMemo(() => {
    return query.viewer?.user?.roles?.includes('EARLY_ACCESS');
  }, [query]);

  const { handleLogout } = useAuthActions();

  const handleSignOutClick = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  return (
    <StyledSettings gap={12}>
      <SettingsContents gap={24}>
        <VStack gap={16}>
          <VStack>
            <TitleDiatypeL>Email notifications</TitleDiatypeL>
            <HStack justify="space-between" align="center">
              <SettingsRowDescription>
                Receive weekly recaps about product updates, airdrop opportunities, and your most
                recent gallery admirers.
              </SettingsRowDescription>
              <Toggle
                checked={isToggleChecked}
                isPending={isPending || isEmailUnverified}
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
          <TitleDiatypeL>Members Club</TitleDiatypeL>
          <HStack justify="space-between" align="center" gap={8}>
            <span>
              <SettingsRowDescription>
                Unlock early access to features, a profile badge, and the members-only{' '}
                <InteractiveLink href={GALLERY_DISCORD}>Discord channel</InteractiveLink> by holding
                a{' '}
                <InteractiveLink
                  href={`https://opensea.io/collection/gallery-membership-cards?ref=${GALLERY_OS_ADDRESS}`}
                >
                  Premium Gallery Membership Card
                </InteractiveLink>{' '}
                and verifying your email address.
              </SettingsRowDescription>
            </span>
            <HStack align="center" gap={4} shrink={false}>
              {hasEarlyAccess ? (
                <>
                  <CircleCheckIcon />
                  <BaseM>Active</BaseM>
                </>
              ) : (
                <BaseM color={colors.metal}>Inactive</BaseM>
              )}
            </HStack>
          </HStack>
        </VStack>
        <StyledHr />
        <VStack gap={16}>
          <TitleDiatypeL>Connect Twitter</TitleDiatypeL>
          <TwitterSetting queryRef={query} />
        </VStack>
        <StyledHr />
        <VStack>
          <TitleDiatypeL>Manage accounts</TitleDiatypeL>
          <ManageWallets
            queryRef={query}
            newAddress={newAddress}
            onTezosAddWalletSuccess={onTezosAddWalletSuccess}
            onEthAddWalletSuccess={onEthAddWalletSuccess}
          />
        </VStack>
        <StyledHr />
        <HStack>
          <StyledButton variant="warning" onClick={handleSignOutClick}>
            Sign Out
          </StyledButton>
        </HStack>
      </SettingsContents>
    </StyledSettings>
  );
}

const StyledSettings = styled(VStack)`
  @media only screen and ${breakpoints.tablet} {
    width: 100%;
  }
  margin-bottom: 64px;
`;

const SettingsContents = styled(VStack)`
  padding: 16px;
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

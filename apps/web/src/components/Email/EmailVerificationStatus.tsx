import { useCallback, useEffect, useMemo } from 'react';
import { graphql, useRefetchableFragment } from 'react-relay';
import styled from 'styled-components';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { EmailVerificationStatusFragment$key } from '~/generated/EmailVerificationStatusFragment.graphql';
import { EmailVerificationStatusMutation } from '~/generated/EmailVerificationStatusMutation.graphql';
import { RefetchableEmailVerificationStatusFragment } from '~/generated/RefetchableEmailVerificationStatusFragment.graphql';
import AlertTriangleIcon from '~/icons/AlertTriangleIcon';
import CircleCheckIcon from '~/icons/CircleCheckIcon';
import ClockIcon from '~/icons/ClockIcon';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import colors from '~/shared/theme/colors';

import { Button } from '../core/Button/Button';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BaseS } from '../core/Text/Text';

const POLLING_INTERVAL_MS = 5000;

type Props = {
  setIsEditMode: (editMode: boolean) => void;
  queryRef: EmailVerificationStatusFragment$key;
};

function EmailVerificationStatus({ setIsEditMode, queryRef }: Props) {
  const [query, refetch] = useRefetchableFragment<
    RefetchableEmailVerificationStatusFragment,
    EmailVerificationStatusFragment$key
  >(
    graphql`
      fragment EmailVerificationStatusFragment on Query
      @refetchable(queryName: "RefetchableEmailVerificationStatusFragment") {
        viewer {
          ... on Viewer {
            email {
              email
              verificationStatus
            }
          }
        }
      }
    `,
    queryRef
  );

  const savedEmail = query?.viewer?.email?.email;
  const verificationStatus = query?.viewer?.email?.verificationStatus;

  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
  }, [setIsEditMode]);

  const [resendVerificationEmail] = usePromisifiedMutation<EmailVerificationStatusMutation>(graphql`
    mutation EmailVerificationStatusMutation {
      resendVerificationEmail {
        ... on ResendVerificationEmailPayload {
          __typename
        }
        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  const { pushToast } = useToastActions();

  const track = useTrack();

  const handleResendClick = useCallback(async () => {
    function pushErrorToast() {
      pushToast({
        autoClose: false,
        message: `Something went wrong while sending a verification email. We are looking into it.`,
      });
    }
    try {
      track('Button Click', {
        id: 'Resend Verification Email Button',
        name: 'Resend Verification Email',
        context: contexts.Email,
      });
      const response = await resendVerificationEmail({ variables: {} });
      if (response.resendVerificationEmail?.__typename !== 'ResendVerificationEmailPayload') {
        pushErrorToast();
        reportError(
          `Could not save email address, typename was ${response.resendVerificationEmail?.__typename}`
        );
      } else {
        pushToast({
          autoClose: false,
          message: `We've resent you an email to verify your email address.`,
        });
      }
    } catch (error) {
      pushErrorToast();
    }
  }, [pushToast, resendVerificationEmail, track]);

  useEffect(
    function pollVerificationStatus() {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      async function fetchAndTimeout() {
        await refetch({}, { fetchPolicy: 'store-and-network' });

        timeoutId = setTimeout(fetchAndTimeout, POLLING_INTERVAL_MS);

        // If the user has verified their email, stop polling
        if (verificationStatus === 'Verified') {
          clearTimeout(timeoutId);
        }
      }

      timeoutId = setTimeout(fetchAndTimeout, POLLING_INTERVAL_MS);

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    },
    [refetch, verificationStatus]
  );

  const resendEmailButton = useMemo(() => {
    return (
      <ResendEmail onClick={handleResendClick}>
        <BaseS color={colors.shadow}>Resend verification email</BaseS>
      </ResendEmail>
    );
  }, [handleResendClick]);

  const verificationStatusIndicator = useMemo(() => {
    switch (verificationStatus) {
      case 'Unverified':
        return (
          <>
            <ClockIcon />
            <BaseS>Pending verification</BaseS>
            {resendEmailButton}
          </>
        );
      case 'Verified':
        return (
          <>
            <CircleCheckIcon />
            <BaseS>Verified</BaseS>
          </>
        );
      case 'Failed':
        return (
          <>
            <AlertTriangleIcon />
            <BaseS>Could not verify.</BaseS>
            {resendEmailButton}
          </>
        );
    }
  }, [resendEmailButton, verificationStatus]);

  return (
    <HStack justify="space-between">
      <VStack>
        <BaseM>{savedEmail}</BaseM>
        <HStack gap={4} align="center">
          {verificationStatusIndicator}
        </HStack>
      </VStack>
      <StyledButton
        eventElementId="Edit Email Button"
        eventName="Edit Email"
        eventContext={contexts.Email}
        variant="secondary"
        onClick={handleEditClick}
      >
        EDIT
      </StyledButton>
    </HStack>
  );
}

const ResendEmail = styled.button`
  background: none;
  border: 0;
  color: ${colors.shadow};
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    text-decoration: none;
  }
`;

const StyledButton = styled(Button)`
  padding: 8px 12px;
`;

export default EmailVerificationStatus;

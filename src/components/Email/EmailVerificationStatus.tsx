import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { EmailVerificationStatusFragment$key } from '~/generated/EmailVerificationStatusFragment.graphql';
import { EmailVerificationStatusMutation } from '~/generated/EmailVerificationStatusMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import AlertTriangleIcon from '~/icons/AlertTriangleIcon';
import CircleCheckIcon from '~/icons/CircleCheckIcon';
import ClockIcon from '~/icons/ClockIcon';

import { Button } from '../core/Button/Button';
import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BaseS } from '../core/Text/Text';

type Props = {
  setIsEditMode: (editMode: boolean) => void;
  queryRef: EmailVerificationStatusFragment$key;
};

function EmailVerificationStatus({ setIsEditMode, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment EmailVerificationStatusFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
            }
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

  const handleResendClick = useCallback(async () => {
    function pushErrorToast() {
      pushToast({
        autoClose: true,
        message: `Something went wrong while sending a verification email. We are looking into it.`,
      });
    }
    try {
      const response = await resendVerificationEmail({ variables: {} });
      if (response.resendVerificationEmail?.__typename !== 'ResendVerificationEmailPayload') {
        pushErrorToast();
        reportError(
          `Could not save email address, typename was ${response.resendVerificationEmail?.__typename}`
        );
      } else {
        pushToast({
          autoClose: true,
          message: `We've resent you an email to verify your email address.`,
        });
      }
    } catch (error) {
      pushErrorToast();
    }
  }, [pushToast, resendVerificationEmail]);

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
        <HStack gap={4}>{verificationStatusIndicator}</HStack>
      </VStack>
      <Button variant="secondary" onClick={handleEditClick}>
        EDIT
      </Button>
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

export default EmailVerificationStatus;

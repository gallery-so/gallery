import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';
import styled from 'styled-components';

import { AdditionalContext, useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { EmailFormFragment$key } from '~/generated/EmailFormFragment.graphql';
import { EmailFormMutation } from '~/generated/EmailFormMutation.graphql';
import useDebounce from '~/hooks/useDebounce';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { EMAIL_FORMAT } from '~/utils/regex';

import { Button } from '../core/Button/Button';
import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';
import { Spinner } from '../core/Spinner/Spinner';
import ErrorText from '../core/Text/ErrorText';
import useVerifyValidEmail from './useVerifyValidEmail';

type Props = {
  setIsEditMode: (editMode: boolean) => void;
  queryRef: EmailFormFragment$key;
  onClose?: () => void;
};

function EmailForm({ setIsEditMode, queryRef, onClose }: Props) {
  const query = useFragment(
    graphql`
      fragment EmailFormFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
            }
            email {
              email
            }
          }
        }
      }
    `,
    queryRef
  );

  const [updateEmail] = usePromisifiedMutation<EmailFormMutation>(graphql`
    mutation EmailFormMutation($input: UpdateEmailInput!) @raw_response_type {
      updateEmail(input: $input) {
        __typename
        ... on UpdateEmailPayload {
          __typename
          viewer {
            email {
              email
              verificationStatus
            }
          }
        }
        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  const savedEmail = query?.viewer?.email?.email;
  const userId = query?.viewer?.user?.id;

  const [email, setEmail] = useState(savedEmail ?? '');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [savePending, setSavePending] = useState(false);

  const showCancelButton = useMemo(() => !!savedEmail || onClose, [onClose, savedEmail]);
  const { pushToast } = useToastActions();

  const { isChecking, verifyEmail } = useVerifyValidEmail();

  const handleEmailChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const debouncedEmail = useDebounce(email, 500);

  useEffect(() => {
    async function checkEmail() {
      if (!EMAIL_FORMAT.test(debouncedEmail)) {
        setIsValidEmail(false);
        return;
      }

      const valid = await verifyEmail(debouncedEmail);

      setIsValidEmail(valid);
    }

    checkEmail();
  }, [debouncedEmail, verifyEmail]);

  const reportError = useReportError();

  const handleCancelClick = useCallback(() => {
    if (onClose) {
      onClose();
    }

    setIsEditMode(false);
  }, [onClose, setIsEditMode]);

  const { route } = useRouter();
  const isOnboarding = route === '/onboarding/add-email';
  const toastSuccessCopy = isOnboarding
    ? `We've sent you an email to verify your email address. You can complete onboarding in the meantime.`
    : `We've sent you an email to verify your email address.`;

  const handleSaveClick = useCallback(async () => {
    setSavePending(true);
    function pushErrorToast() {
      pushToast({
        autoClose: false,
        message: `Something went wrong while saving your email address. We are looking into it.`,
      });
    }

    const errorMetadata: AdditionalContext['tags'] = {
      userId,
    };

    const updater: SelectorStoreUpdater<EmailFormMutation['response']> = (store, response) => {
      if (response?.updateEmail?.__typename === 'UpdateEmailPayload') {
        const verificationStatus = response.updateEmail.viewer?.email?.verificationStatus;

        store
          .get('client:root:viewer')
          ?.getLinkedRecord('email')
          ?.setValue(verificationStatus, 'verificationStatus');
      }
    };

    try {
      const response = await updateEmail({
        variables: { input: { email } },
        updater,
      });

      if (response.updateEmail?.__typename !== 'UpdateEmailPayload') {
        // ERROR
        pushErrorToast();

        reportError(
          `Could not save email address, typename was ${response.updateEmail?.__typename}`,
          {
            tags: errorMetadata,
          }
        );
      } else {
        // SUCCESS
        pushToast({
          autoClose: false,
          message: toastSuccessCopy,
        });
        setIsEditMode(false);
      }
      setSavePending(false);
    } catch (error) {
      pushErrorToast();
      setSavePending(false);
    }
  }, [email, pushToast, reportError, setIsEditMode, toastSuccessCopy, updateEmail, userId]);

  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      handleSaveClick();
    },
    [handleSaveClick]
  );

  const showErrorMessage = useMemo(() => {
    return !isValidEmail && debouncedEmail && !isChecking;
  }, [debouncedEmail, isChecking, isValidEmail]);

  return (
    <form onSubmit={handleFormSubmit}>
      <VStack gap={8}>
        <StyledInput
          onChange={handleEmailChange}
          placeholder="Email address"
          defaultValue={savedEmail || ''}
          autoFocus
          disabled={savePending}
        />

        <HStack align="center" justify={showErrorMessage ? 'space-between' : 'flex-end'}>
          {showErrorMessage && <ErrorText message={"The email doesn't appear to be valid"} />}

          <HStack gap={8}>
            {showCancelButton && (
              <Button variant="secondary" disabled={savePending} onClick={handleCancelClick}>
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              disabled={!isValidEmail || savePending || savedEmail === email || isChecking}
              onClick={handleSaveClick}
            >
              {isChecking ? <Spinner /> : 'Save'}
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </form>
  );
}

const StyledInput = styled.input`
  border: 0;
  background-color: ${colors.faint};
  padding: 6px 12px;
  width: 100%;
  height: 32px;
`;

export default EmailForm;

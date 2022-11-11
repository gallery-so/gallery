import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { AdditionalContext, useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { EmailFormFragment$key } from '~/generated/EmailFormFragment.graphql';
import { EmailFormMutation } from '~/generated/EmailFormMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { EMAIL_FORMAT } from '~/utils/regex';

import { Button } from '../core/Button/Button';
import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';

type Props = {
  setIsEditMode: (editMode: boolean) => void;
  queryRef: EmailFormFragment$key;
};

function EmailForm({ setIsEditMode, queryRef }: Props) {
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
    mutation EmailFormMutation($input: UpdateEmailInput!) {
      updateEmail(input: $input) {
        ... on UpdateEmailPayload {
          __typename
          viewer {
            email {
              email
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
  const [savePending, setSavePending] = useState(false);

  const showCancelButton = useMemo(() => !!savedEmail, [savedEmail]);
  const { pushToast } = useToastActions();

  const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const isValidEmail = useMemo(() => EMAIL_FORMAT.test(email), [email]);

  const reportError = useReportError();

  const handleCancelClick = useCallback(() => {
    setIsEditMode(false);
  }, [setIsEditMode]);

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

    try {
      const response = await updateEmail({ variables: { input: { email } } });

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

  return (
    <form onSubmit={handleFormSubmit}>
      <VStack gap={8}>
        <StyledInput
          onChange={handleEmailChange}
          placeholder="Enter your email address..."
          defaultValue={savedEmail || ''}
          autoFocus
          disabled={savePending}
        />
        <HStack justify={showCancelButton ? 'space-between' : 'flex-end'} align="flex-end">
          {showCancelButton && (
            <Button variant="secondary" disabled={savePending} onClick={handleCancelClick}>
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            disabled={!isValidEmail || savePending || savedEmail === email}
            onClick={handleSaveClick}
          >
            Save
          </Button>
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

import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

import { Button } from '../core/Button/Button';
import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';

type Props = {
  savedEmail: string;
  setIsEditMode: (editMode: boolean) => void;
};

function EmailForm({ savedEmail, setIsEditMode, queryRef }: Props) {
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

  console.log('query', query);

  const [updateEmail] = usePromisifiedMutation<EmailFormMutation>(graphql`
    mutation EmailFormMutation($input: UpdateEmailInput!) @raw_response_type {
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

  const [email, setEmail] = useState(savedEmail ?? '');
  const [savePending, setSavePending] = useState(false);

  const showCancelButton = useMemo(() => !!savedEmail, [savedEmail]);
  const { pushToast } = useToastActions();

  const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const handleCancelClick = useCallback(() => {
    setIsEditMode(false);
  }, [setIsEditMode]);

  const handleSaveClick = useCallback(async () => {
    console.log('saving', email);
    setSavePending(true);
    function pushErrorToast() {
      pushToast({
        autoClose: true,
        message: `Something went wrong while saving your email address. We are looking into it.`,
      });
    }

    // const errorMetadata: AdditionalContext['tags'] = {
    //   userId: query.viewer.user.dbid,
    // };

    try {
      const response = await updateEmail({ variables: { input: { email } } });

      if (response.updateEmail?.__typename !== 'UpdateEmailPayload') {
        // ERROR
        pushErrorToast();

        reportError(
          `Could not save email address, typename was ${response.updateEmail?.__typename}`,
          {
            // tags: errorMetadata,
          }
        );
      } else {
        // SUCCESS
        pushToast({
          autoClose: true,
          message: `We've sent you an email to verify your email address. You can complete onboarding in the meantime.`,
        });
        setIsEditMode(false);
      }
      setSavePending(false);
    } catch (error) {
      // errorr
      setSavePending(false);
      console.log(error);
    }
    // save email to backend
    // set state
    // handle error
  }, [email, pushToast, setIsEditMode, updateEmail]);

  const handleFormSubmit = useCallback(
    (event) => {
      event?.preventDefault();
      handleSaveClick();
    },
    [handleSaveClick]
  );

  return (
    // <div>
    <form onSubmit={handleFormSubmit}>
      <VStack gap={8}>
        <StyledInput
          onChange={handleEmailChange}
          placeholder="Enter your email address..."
          defaultValue={savedEmail}
          autoFocus
          disabled={savePending}
        />
        <HStack justify={showCancelButton ? 'space-between' : 'flex-end'} align="flex-end">
          {showCancelButton && (
            <Button variant="secondary" disabled={savePending} onClick={handleCancelClick}>
              Cancel
            </Button>
          )}
          <Button variant="primary" disabled={savePending} onClick={handleSaveClick}>
            Save
          </Button>
        </HStack>
      </VStack>
    </form>
    // </div>
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

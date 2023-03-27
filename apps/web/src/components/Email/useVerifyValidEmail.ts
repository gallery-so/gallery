import { useCallback, useState } from 'react';
import { graphql } from 'react-relay';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useVerifyValidEmailMutation } from '~/generated/useVerifyValidEmailMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

const VALID_EMAIL_STATUS = ['Risky', 'Valid'];

export default function useVerifyValidEmail() {
  const [isChecking, setIsChecking] = useState(false);

  const [verifyValidEmail] = usePromisifiedMutation<useVerifyValidEmailMutation>(graphql`
    mutation useVerifyValidEmailMutation($input: PreverifyEmailInput!) @raw_response_type {
      preverifyEmail(input: $input) {
        ... on PreverifyEmailPayload {
          __typename
          email
          result
        }
        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  const { pushToast } = useToastActions();

  const verifyEmail = useCallback(
    async (email: string) => {
      try {
        setIsChecking(true);
        const response = await verifyValidEmail({
          variables: {
            input: {
              email,
            },
          },
        });

        const { preverifyEmail } = response;

        if (preverifyEmail?.__typename === 'ErrInvalidInput' || !preverifyEmail) {
          return false;
        }

        if (preverifyEmail?.__typename === 'PreverifyEmailPayload') {
          return VALID_EMAIL_STATUS.includes(preverifyEmail.result);
        }

        return false;
      } catch (error) {
        pushToast({
          message: 'Unfortunately there was an error to verify your email address',
          autoClose: true,
        });
        return false;
      } finally {
        setIsChecking(false);
      }
    },
    [pushToast, verifyValidEmail]
  );

  return { verifyEmail, isChecking };
}

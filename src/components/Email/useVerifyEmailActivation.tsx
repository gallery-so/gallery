import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useVerifyEmailActivationMutation } from '~/generated/useVerifyEmailActivationMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useVerifyEmailActivation() {
  const [verifyEmailMutate] = usePromisifiedMutation<useVerifyEmailActivationMutation>(graphql`
    mutation useVerifyEmailActivationMutation($token: String!) @raw_response_type {
      verifyEmail(token: $token) {
        ... on VerifyEmailPayload {
          __typename
          email
        }
        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  const updater: SelectorStoreUpdater<useVerifyEmailActivationMutation['response']> = (
    store,
    response
  ) => {
    if (response.verifyEmail?.__typename === 'VerifyEmailPayload' && response.verifyEmail?.email) {
      store
        .get('client:root:viewer')
        ?.getLinkedRecord('email')
        ?.setValue('Verified', 'verificationStatus');
    }
  };

  const { pushToast } = useToastActions();

  return useCallback(
    async (token: string) => {
      try {
        const response = await verifyEmailMutate({
          variables: { token },
          updater,
        });

        if (!response.verifyEmail) {
          pushToast({
            message:
              'Unfortunately there was an error verifying your email address. Please request a new verification email via your Notification Settings or reach out to us on discord.',
            variant: 'error',
          });
          return;
        }

        pushToast({
          message: 'Your email address has been successfully verified.',
        });
      } catch (error) {
        if (error instanceof Error) {
          pushToast({
            message:
              'Unfortunately there was an error verifying your email address. Please request a new verification email via your Notification Settings or reach out to us on discord.',
            variant: 'error',
          });
        }
      }
    },
    [pushToast, verifyEmailMutate]
  );
}

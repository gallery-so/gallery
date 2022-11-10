import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { graphql } from 'react-relay';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useVerifyEmailOnPageMutation } from '~/generated/useVerifyEmailOnPageMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useVerifyEmailOnPage() {
  const [verifyEmailMutate] = usePromisifiedMutation<useVerifyEmailOnPageMutation>(graphql`
    mutation useVerifyEmailOnPageMutation($token: String!) @raw_response_type {
      verifyEmail(token: $token) {
        ... on VerifyEmailPayload {
          email
        }
        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  const router = useRouter();
  const { verifyEmail } = router.query;
  const { pushToast } = useToastActions();

  useEffect(() => {
    if (!verifyEmail) return;
    const handleVerifyEmail = async (token: string) => {
      try {
        const response = await verifyEmailMutate({
          variables: { token },
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
        console.error(error);
        pushToast({
          message:
            'Unfortunately there was an error verifying your email address. Please request a new verification email via your Notification Settings or reach out to us on discord.',
          variant: 'error',
        });
      }
    };
    handleVerifyEmail(verifyEmail as string);
  }, [pushToast, verifyEmail, verifyEmailMutate]);
}

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useVerifyEmailOnPageQueryFragment$key } from '~/generated/useVerifyEmailOnPageQueryFragment.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import useVerifyEmailActivation from './useVerifyEmailActivation';

export default function useVerifyEmailOnPage(queryRef: useVerifyEmailOnPageQueryFragment$key) {
  const query = useFragment(
    graphql`
      fragment useVerifyEmailOnPageQueryFragment on Query {
        viewer {
          ... on Viewer {
            email {
              verificationStatus
            }
          }
        }
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const verificationStatus = query.viewer?.email?.verificationStatus;
  const isEmailFeatureEnabled = isFeatureEnabled(FeatureFlag.EMAIL, query);
  const verifyEmailActivation = useVerifyEmailActivation();

  const router = useRouter();
  const { verifyEmail } = router.query;
  const { pushToast } = useToastActions();

  useEffect(() => {
    if (!isEmailFeatureEnabled) return;

    // If the user is already verified and have invalid verifyEmail, don't do anything
    if (!verifyEmail || verificationStatus === 'Verified') return;

    const handleVerifyEmail = async (token: string) => {
      try {
        const response = await verifyEmailActivation(token);

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
    };

    handleVerifyEmail(verifyEmail as string);
  }, [isEmailFeatureEnabled, pushToast, verifyEmail, verificationStatus, verifyEmailActivation]);
}

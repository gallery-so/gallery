import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useVerifyEmailOnPageQueryFragment$key } from '~/generated/useVerifyEmailOnPageQueryFragment.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import { FAILED_EMAIL_VERIFICATION_STATUS } from '../NotificationsModal/NotificationList';
import useUnsubscribeEmail from './useUnsubscribeEmail';
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
  const unsubscribeEmail = useUnsubscribeEmail();

  const router = useRouter();
  const { verifyEmail, unsubscribeToken } = router.query;
  const { pushToast } = useToastActions();

  useEffect(() => {
    if (!isEmailFeatureEnabled) return;

    // If the user is already verified, we don't need to do anything
    if (verifyEmail && FAILED_EMAIL_VERIFICATION_STATUS.includes(verificationStatus ?? '')) {
      verifyEmailActivation(verifyEmail as string);
    }

    // check unsubscribe token
    if (unsubscribeToken) {
      unsubscribeEmail({ type: 'Notifications', token: unsubscribeToken as string });
    }
  }, [
    isEmailFeatureEnabled,
    pushToast,
    unsubscribeEmail,
    unsubscribeToken,
    verifyEmail,
    verificationStatus,
    verifyEmailActivation,
  ]);
}

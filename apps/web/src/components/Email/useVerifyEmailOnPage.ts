import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useVerifyEmailOnPageQueryFragment$key } from '~/generated/useVerifyEmailOnPageQueryFragment.graphql';

import { FAILED_EMAIL_VERIFICATION_STATUS } from '../Notifications/NotificationList';
import useUnsubscribeEmail from './useUnsubscribeEmail';
import useVerifyEmailActivation from './useVerifyEmailActivation';

export default function useVerifyEmailOnPage(queryRef: useVerifyEmailOnPageQueryFragment$key) {
  const query = useFragment(
    graphql`
      fragment useVerifyEmailOnPageQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
            email {
              verificationStatus
            }
          }
        }
      }
    `,
    queryRef
  );

  const verificationStatus = query.viewer?.email?.verificationStatus;
  const verifyEmailActivation = useVerifyEmailActivation();
  const unsubscribeEmail = useUnsubscribeEmail();

  const router = useRouter();
  const { verifyEmail, unsubscribeToken } = router.query;
  const { pushToast } = useToastActions();

  useEffect(() => {
    const isLoggedIn = query.viewer?.user?.dbid;

    // Verify email address if verificationStatus is not in the verified state
    // OR there is no viewer, because we allow verification without signing in
    if (
      verifyEmail &&
      (FAILED_EMAIL_VERIFICATION_STATUS.includes(verificationStatus ?? '') || !isLoggedIn)
    ) {
      verifyEmailActivation(verifyEmail as string);
    }

    // check unsubscribe token
    if (unsubscribeToken) {
      unsubscribeEmail({ type: 'Notifications', token: unsubscribeToken as string });
    }
  }, [
    pushToast,
    unsubscribeEmail,
    unsubscribeToken,
    verifyEmail,
    verificationStatus,
    verifyEmailActivation,
    query.viewer,
  ]);
}

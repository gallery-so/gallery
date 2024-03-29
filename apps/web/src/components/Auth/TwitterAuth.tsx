import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { TWITTER_LOCAL_STORAGE_KEY } from '~/constants/twitter';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { TwitterAuthMutation } from '~/generated/TwitterAuthMutation.graphql';
import { TwitterAuthQueryFragment$key } from '~/generated/TwitterAuthQueryFragment.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

import FullPageLoader from '../core/Loader/FullPageLoader';

type Props = {
  queryRef: TwitterAuthQueryFragment$key;
};

export default function TwitterAuth({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment TwitterAuthQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  const username = query.viewer?.user?.username;

  const [verifyTwitter] = usePromisifiedMutation<TwitterAuthMutation>(graphql`
    mutation TwitterAuthMutation($input: SocialAuthMechanism!) {
      connectSocialAccount(input: $input) {
        __typename
      }
    }
  `);

  const router = useRouter();
  const { pushToast } = useToastActions();

  const { code, error } = router.query;

  if (!username) {
    throw new Error('Try to authorize Twitter without username');
  }

  const reportError = useReportError();

  const handleVerifyTwitter = useCallback(async () => {
    if (!code) return;

    const payload = {
      twitter: {
        code: code as string,
      },
    };

    try {
      await verifyTwitter({
        variables: {
          input: payload,
        },
      });

      // If the user was redirected from the TwitterAuth page, we want to redirect them back to the page they were on
      const localStorageTwitterValue = localStorage.getItem(TWITTER_LOCAL_STORAGE_KEY);
      const previousRoute = localStorageTwitterValue ? JSON.parse(localStorageTwitterValue) : null;

      if (previousRoute) {
        localStorage.removeItem(TWITTER_LOCAL_STORAGE_KEY);
        router.push(previousRoute);
        return;
      }

      router.push({
        pathname: '/[username]',
        query: {
          username,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        reportError(error, { tags: { username } });
        pushToast({
          message: 'Failed to authorize your Twitter account',
        });
      } else {
        reportError('Uncaught error in TwitterAuth');
      }
    }
  }, [code, pushToast, reportError, router, username, verifyTwitter]);

  useEffect(() => {
    if (!error) {
      handleVerifyTwitter();
      return;
    }

    router.push({
      pathname: '/[username]',
      query: {
        username,
        twitter: 'true',
      },
    });

    reportError(`${error}`, { tags: { username } });
    pushToast({
      message: 'Failed to authorize your Twitter account',
    });
  }, [error, handleVerifyTwitter, pushToast, reportError, router, username]);

  return <FullPageLoader />;
}

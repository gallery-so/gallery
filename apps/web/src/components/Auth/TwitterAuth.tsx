import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { TwitterAuthMutation } from '~/generated/TwitterAuthMutation.graphql';
import { TwitterAuthQueryFragment$key } from '~/generated/TwitterAuthQueryFragment.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

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
      },
    });

    reportError(`${error}`, { tags: { username } });
    pushToast({
      message: 'Failed to authorize your Twitter account',
    });
  }, [error, handleVerifyTwitter, pushToast, reportError, router, username]);

  return <FullPageLoader />;
}

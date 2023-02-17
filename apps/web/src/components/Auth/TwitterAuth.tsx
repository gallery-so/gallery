import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

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

  const { code } = router.query;

  const handleVerifyTwitter = useCallback(async () => {
    if (!username || !code) return;

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
      console.error(error);
    }
  }, [code, router, username, verifyTwitter]);

  useEffect(() => {
    handleVerifyTwitter();
  }, [handleVerifyTwitter]);

  return <FullPageLoader />;
}

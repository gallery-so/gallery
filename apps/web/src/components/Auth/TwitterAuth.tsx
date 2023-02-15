import { useEffect } from 'react';
import { graphql } from 'relay-runtime';

import { TwitterAuthMutation } from '~/generated/TwitterAuthMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

// enum SocialAccountType {
//   Twitter = 'Twitter',
// }

type Props = {
  code: string;
};

export default function TwitterAuth({ code }: Props) {
  const [verifyTwitter] = usePromisifiedMutation<TwitterAuthMutation>(graphql`
    mutation TwitterAuthMutation($input: SocialAuthMechanism!) {
      connectSocialAccount(input: $input) {
        __typename
      }
    }
  `);

  useEffect(() => {
    const payload = {
      twitter: {
        code: code as string,
      },
      //   debug: {
      //     provider: SocialAccountType.Twitter,
      //     id: 'twitter',
      //     username: 'twitter',
      //   },
    };

    verifyTwitter({
      variables: {
        input: payload,
      },
    });
  }, [code, verifyTwitter]);

  return <div>Twitter</div>;
}

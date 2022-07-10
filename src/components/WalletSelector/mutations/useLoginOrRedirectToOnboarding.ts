import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import {
  useLoginOrRedirectToOnboardingMutation,
  useLoginOrRedirectToOnboardingMutation$variables,
} from '__generated__/useLoginOrRedirectToOnboardingMutation.graphql';

export default function useLoginOrRedirectToOnboarding() {
  const [login] = usePromisifiedMutation<useLoginOrRedirectToOnboardingMutation>(
    graphql`
      mutation useLoginOrRedirectToOnboardingMutation($mechanism: AuthMechanism!) {
        login(authMechanism: $mechanism) {
          __typename

          ... on LoginPayload {
            userId @required(action: THROW)
          }
          ... on ErrUserNotFound {
            message
          }
          ... on ErrAuthenticationFailed {
            message
          }
          ... on ErrDoesNotOwnRequiredToken {
            message
          }
        }
      }
    `
  );

  type Props = {
    authMechanism: useLoginOrRedirectToOnboardingMutation$variables;
    userExists: boolean;
  };

  const { push } = useRouter();

  return useCallback(
    async ({ authMechanism, userExists }: Props): Promise<string | undefined> => {
      if (userExists) {
        const { login: result } = await login({
          variables: authMechanism,
        });

        if (!result) {
          throw new Error('login failed to execute. response data missing');
        }

        if (result.__typename === 'LoginPayload') {
          return result.userId;
        }

        if (result && 'message' in result) {
          throw new Error(result.message);
        }

        throw new Error(`Unexpected type returned from login mutation: ${result?.__typename}`);
      } else {
        // Redirect user to the onboarding flow with necessary input params to create an account
        if (authMechanism.mechanism.eoa) {
          push(
            {
              pathname: '/welcome',
              query: {
                chain: 'Ethereum',
                address: authMechanism.mechanism.eoa.chainAddress.address,
                nonce: authMechanism.mechanism.eoa.nonce,
                signature: authMechanism.mechanism.eoa.signature,
              },
            },
            '/welcome'
          );
        }

        // TODO: does the gnosis safe flow lead to account creation, even without a signature?
        // the only inputs for its AuthMechanism are `address` and `nonce`
        if (authMechanism.mechanism.gnosisSafe) {
        }

        return;
      }
    },
    // remove `push` from dependency array as it'll trigger this callback to change on route change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [login]
  );
}

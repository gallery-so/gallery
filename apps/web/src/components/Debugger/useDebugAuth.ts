import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import {
  DebugAuth,
  useDebugAuthLoginMutation,
} from '~/generated/useDebugAuthLoginMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export function useDebugAuthLogin() {
  const [login] = usePromisifiedMutation<useDebugAuthLoginMutation>(
    graphql`
      mutation useDebugAuthLoginMutation($mechanism: AuthMechanism!) {
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

  return useCallback(
    async ({ asUsername, userId, chainAddresses, debugToolsPassword }: DebugAuth) => {
      const { login: result } = await login({
        variables: {
          mechanism: {
            debug: {
              asUsername,
              userId,
              chainAddresses,
              debugToolsPassword,
            },
          },
        },
      });

      if (!result) {
        throw new Error('login failed to execute; check the network tab for more info.');
      }

      if (result.__typename === 'LoginPayload') {
        return result.userId;
      }

      if (result && 'message' in result) {
        throw new Error(result.message);
      }

      return '';
    },
    [login]
  );
}

// TODO: implement
export function useDebugAuthCreateUser() {}

// TODO: implement
export function useDebugAuthAddWallet() {}

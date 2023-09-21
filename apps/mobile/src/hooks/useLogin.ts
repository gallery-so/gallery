import { useCallback } from 'react';
import { graphql } from 'react-relay';

import {
  AuthMechanism,
  useLoginMutationMutation,
} from '~/generated/useLoginMutationMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type useLoginMutationCallbackReturnType =
  | {
      kind: 'success';
    }
  | { kind: 'failure'; message: string };

export function useLogin(): [
  (authMechanism: AuthMechanism) => Promise<useLoginMutationCallbackReturnType>,
  boolean
] {
  const [mutate, isLoggingIn] = usePromisifiedMutation<useLoginMutationMutation>(graphql`
    mutation useLoginMutationMutation($authMechanism: AuthMechanism!) {
      login(authMechanism: $authMechanism) {
        ... on LoginPayload {
          __typename
          userId
          viewer {
            ... on Viewer {
              user {
                __typename
                primaryWallet {
                  __typename
                }
              }
            }
          }
        }

        ... on Error {
          __typename
          message
        }
      }
    }
  `);

  const login = useCallback(
    async (authMechanism: AuthMechanism): Promise<useLoginMutationCallbackReturnType> => {
      try {
        const result = await mutate({
          variables: {
            authMechanism,
          },
        });

        if (result.login?.__typename === 'LoginPayload') {
          return { kind: 'success' };
        } else if (result.login?.message) {
          return { kind: 'failure', message: result.login.message };
        } else {
          return { kind: 'failure', message: 'Something unexpected went wrong' };
        }
      } catch (error) {
        if (error instanceof Error) {
          return { kind: 'failure', message: error.message };
        } else {
          return { kind: 'failure', message: 'Something unexpected went wrong' };
        }
      }
    },
    [mutate]
  );

  return [login, isLoggingIn];
}

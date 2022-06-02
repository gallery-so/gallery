import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import {
  useLoginOrCreateUserCreateUserMutation,
  useLoginOrCreateUserCreateUserMutation$variables,
} from '__generated__/useLoginOrCreateUserCreateUserMutation.graphql';
import {
  useLoginOrCreateUserLoginMutation,
  useLoginOrCreateUserLoginMutation$variables,
} from '__generated__/useLoginOrCreateUserLoginMutation.graphql';

export default function useLoginOrCreateUser() {
  const [login] = usePromisifiedMutation<useLoginOrCreateUserLoginMutation>(
    graphql`
      mutation useLoginOrCreateUserLoginMutation($mechanism: AuthMechanism!) {
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

  const [createUser] = usePromisifiedMutation<useLoginOrCreateUserCreateUserMutation>(
    graphql`
      mutation useLoginOrCreateUserCreateUserMutation($mechanism: AuthMechanism!) {
        createUser(authMechanism: $mechanism) {
          __typename
          ... on CreateUserPayload {
            userId @required(action: THROW)
          }
          ... on ErrUserAlreadyExists {
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

  type LoginOrCreateUserInput =
    | {
        variables: useLoginOrCreateUserCreateUserMutation$variables;
        userExists: false;
      }
    | { variables: useLoginOrCreateUserLoginMutation$variables; userExists: true };

  return useCallback(
    async ({
      variables,
      userExists,
    }: LoginOrCreateUserInput): Promise<{
      userId: string;
    }> => {
      if (userExists) {
        const { login: result } = await login({
          variables,
        });

        if (!result) {
          throw new Error('login failed to execute. response data missing');
        }

        if (result.__typename === 'LoginPayload') {
          return { userId: result.userId };
        }

        if (result && 'message' in result) {
          throw new Error(result.message);
        }

        throw new Error(`Unexpected type returned from login mutation: ${result?.__typename}`);
      } else {
        const { createUser: result } = await createUser({ variables });

        if (!result) {
          throw new Error('createUser failed to execute. response data missing');
        }

        if (result.__typename === 'CreateUserPayload') {
          return { userId: result.userId };
        }

        if ('message' in result) {
          throw new Error(result.message);
        }

        throw new Error(`Unexpected type returned from createUser mutation: ${result?.__typename}`);
      }
    },
    [createUser, login]
  );
}

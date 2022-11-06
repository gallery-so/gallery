import { useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';

import { useCreateUserMutation } from '~/generated/useCreateUserMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

import { AuthPayloadVariables, isEoaPayload } from './useAuthPayloadQuery';

export default function useCreateUser() {
  const environment = useRelayEnvironment();

  const [createUser] = usePromisifiedMutation<useCreateUserMutation>(
    graphql`
      mutation useCreateUserMutation(
        $authMechanism: AuthMechanism!
        $username: String!
        $bio: String
      ) {
        createUser(authMechanism: $authMechanism, username: $username, bio: $bio) {
          __typename
          ... on CreateUserPayload {
            __typename
          }
          ... on ErrAuthenticationFailed {
            __typename
          }
          ... on ErrDoesNotOwnRequiredToken {
            __typename
          }
          ... on ErrUserAlreadyExists {
            __typename
          }
          ... on ErrUsernameNotAvailable {
            __typename
          }
          ... on ErrInvalidInput {
            __typename
          }
        }
      }
    `
  );

  return useCallback(
    async (authPayloadVariables: AuthPayloadVariables, username: string, bio: string) => {
      let authMechanism: useCreateUserMutation['variables']['authMechanism'];

      if (isEoaPayload(authPayloadVariables)) {
        const { chain, address, nonce, signature } = authPayloadVariables;

        authMechanism = {
          eoa: {
            chainPubKey: {
              chain,
              pubKey: address,
            },
            nonce,
            signature,
          },
        };
      } else {
        const { address, nonce } = authPayloadVariables;
        authMechanism = {
          gnosisSafe: {
            address,
            nonce,
          },
        };
      }

      const response = await createUser({
        variables: {
          authMechanism,
          username,
          bio,
        },
      });

      if (!response.createUser) {
        throw new Error('Unknown error occurred');
      }
      if (response.createUser?.__typename === 'ErrAuthenticationFailed') {
        throw new Error('Authentication failed');
      }
      if (response.createUser?.__typename === 'ErrDoesNotOwnRequiredToken') {
        throw new Error('You do not own the required tokens');
      }
      if (response.createUser?.__typename === 'ErrUserAlreadyExists') {
        throw new Error('A user already exists with the provided wallet address');
      }
      if (response.createUser?.__typename === 'ErrUsernameNotAvailable') {
        throw new Error('The username is taken');
      }
      if (response.createUser?.__typename === 'ErrInvalidInput') {
        throw new Error('Username or bio is invalid');
      }

      // Update the cache with a fresh user.
      // This is to ensure the entire app knows we're logged in now
      await fetchQuery(
        environment,
        graphql`
          query useCreateUserRefreshViewerQuery {
            viewer {
              ... on Viewer {
                user {
                  id
                }
              }
            }
          }
        `,
        {}
      ).toPromise();

      return response;
    },
    [createUser, environment]
  );
}

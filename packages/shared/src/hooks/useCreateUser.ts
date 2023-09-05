import { useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';

import { useCreateUserMutation } from '~/generated/useCreateUserMutation.graphql';
import { useCreateUserRefreshViewerQuery } from '~/generated/useCreateUserRefreshViewerQuery.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';
import { AuthPayloadVariables, isEmailPayload, isEoaPayload } from './useAuthPayloadQuery';

export default function useCreateUser() {
  const environment = useRelayEnvironment();

  const [createUser] = usePromisifiedMutation<useCreateUserMutation>(
    graphql`
      mutation useCreateUserMutation($authMechanism: AuthMechanism!, $input: CreateUserInput!) {
        createUser(authMechanism: $authMechanism, input: $input) {
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
      } else if (isEmailPayload(authPayloadVariables)) {
        const { token } = authPayloadVariables;
        authMechanism = {
          magicLink: {
            token,
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
          input: {
            username,
            bio,
          },
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
      await fetchQuery<useCreateUserRefreshViewerQuery>(
        environment,
        graphql`
          query useCreateUserRefreshViewerQuery {
            viewer {
              ... on Viewer {
                # eslint-disable-next-line relay/unused-fields
                user {
                  # eslint-disable-next-line relay/unused-fields
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

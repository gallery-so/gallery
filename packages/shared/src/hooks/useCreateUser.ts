import { useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';

import { useCreateUserDeprecatedMutation } from '~/generated/useCreateUserDeprecatedMutation.graphql';
import { useCreateUserDeprecatedRefreshViewerQuery } from '~/generated/useCreateUserDeprecatedRefreshViewerQuery.graphql';
import { CreateUserInput, useCreateUserMutation } from '~/generated/useCreateUserMutation.graphql';
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
            viewer {
              ... on Viewer {
                user {
                  username
                  potentialEnsProfileImage {
                    wallet {
                      chainAddress {
                        chain @required(action: NONE)
                        address @required(action: NONE)
                      }
                    }
                    profileImage {
                      previewURLs {
                        medium
                      }
                    }
                    token {
                      dbid
                    }
                  }
                }
              }
            }
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
    async ({
      authPayloadVariables,
      username,
      bio,
      email,
    }: {
      authPayloadVariables: AuthPayloadVariables;
      username: string;
      bio: string;
      email?: string;
    }) => {
      const authMechanism: useCreateUserMutation['variables']['authMechanism'] =
        getAuthMechanismFromAuthPayload(authPayloadVariables);

      const createUserInput: CreateUserInput = {
        username,
        bio,
      };

      if (email) {
        createUserInput.email = email;
      }

      const response = await createUser({
        variables: {
          authMechanism,
          input: createUserInput,
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
                  potentialEnsProfileImage {
                    wallet {
                      chainAddress {
                        chain @required(action: NONE)
                        address @required(action: NONE)
                      }
                    }
                  }
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

export function getAuthMechanismFromAuthPayload(authPayloadVariables: AuthPayloadVariables) {
  let authMechanism: useCreateUserMutation['variables']['authMechanism'];

  if (isEoaPayload(authPayloadVariables)) {
    const { chain, address, nonce, message, signature } = authPayloadVariables;

    authMechanism = {
      eoa: {
        chainPubKey: {
          chain,
          pubKey: address,
        },
        nonce,
        message,
        signature,
      },
    };
  } else if (isEmailPayload(authPayloadVariables)) {
    const { token } = authPayloadVariables;
    authMechanism = {
      privy: {
        token: token!,
      },
    };
  } else if (authPayloadVariables.authMechanismType === 'gnosisSafe') {
    const { address, nonce, message } = authPayloadVariables;
    authMechanism = {
      gnosisSafe: {
        address,
        nonce,
        message,
      },
    };
  } else if (authPayloadVariables.authMechanismType === 'neynar') {
    const { address, nonce, message, signature, primaryAddress } = authPayloadVariables;
    authMechanism = {
      neynar: {
        nonce,
        message,
        signature,
        custodyPubKey: {
          pubKey: address,
          chain: 'Ethereum',
        },
      },
    };
    if (primaryAddress) {
      authMechanism.neynar!.primaryPubKey = {
        pubKey: primaryAddress,
        chain: 'Ethereum',
      };
    }
  }

  // @ts-expect-error: ts doesn't think authMechanism is defined when it clearly is
  return authMechanism;
}

// TODO: use `useCreateUser` instead after web is migrated from magic link -> privy
export function useDeprecatedCreateUser() {
  const environment = useRelayEnvironment();

  const [createUser] = usePromisifiedMutation<useCreateUserDeprecatedMutation>(
    graphql`
      mutation useCreateUserDeprecatedMutation(
        $authMechanism: AuthMechanism!
        $input: CreateUserInput!
      ) {
        createUser(authMechanism: $authMechanism, input: $input) {
          __typename
          ... on CreateUserPayload {
            __typename
            viewer {
              ... on Viewer {
                user {
                  username
                  potentialEnsProfileImage {
                    wallet {
                      chainAddress {
                        chain @required(action: NONE)
                        address @required(action: NONE)
                      }
                    }
                    profileImage {
                      previewURLs {
                        medium
                      }
                    }
                    token {
                      dbid
                    }
                  }
                }
              }
            }
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
      let authMechanism: useCreateUserDeprecatedMutation['variables']['authMechanism'];

      if (isEoaPayload(authPayloadVariables)) {
        const { chain, address, nonce, message, signature } = authPayloadVariables;

        authMechanism = {
          eoa: {
            chainPubKey: {
              chain,
              pubKey: address,
            },
            nonce,
            message,
            signature,
          },
        };
      } else if (authPayloadVariables.authMechanismType === 'magicLink') {
        const { token } = authPayloadVariables;
        authMechanism = {
          magicLink: {
            token: token ?? '',
          },
        };
      } else if (
        authPayloadVariables.authMechanismType === 'eoa' ||
        authPayloadVariables.authMechanismType === 'gnosisSafe'
      ) {
        const { address, nonce, message } = authPayloadVariables;
        authMechanism = {
          gnosisSafe: {
            address,
            nonce,
            message,
          },
        };
      }

      const response = await createUser({
        variables: {
          // @ts-expect-error: ts doesn't think authMechanism is defined when it clearly is
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
      await fetchQuery<useCreateUserDeprecatedRefreshViewerQuery>(
        environment,
        graphql`
          query useCreateUserDeprecatedRefreshViewerQuery {
            viewer {
              ... on Viewer {
                # eslint-disable-next-line relay/unused-fields
                user {
                  # eslint-disable-next-line relay/unused-fields
                  id
                  potentialEnsProfileImage {
                    wallet {
                      chainAddress {
                        chain @required(action: NONE)
                        address @required(action: NONE)
                      }
                    }
                  }
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

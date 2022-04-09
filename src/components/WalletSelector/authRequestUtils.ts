import { FetcherType } from 'contexts/swr/useFetcher';
import { Web3Error } from 'types/Error';
import { graphql } from 'relay-runtime';
import { authRequestUtilsCreateNonceMutation } from '../../../__generated__/authRequestUtilsCreateNonceMutation.graphql';
import { useCallback } from 'react';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import {
  authRequestUtilsLoginMutation,
  authRequestUtilsLoginMutation$variables,
} from '__generated__/authRequestUtilsLoginMutation.graphql';
import {
  authRequestUtilsCreateUserMutation,
  authRequestUtilsCreateUserMutation$variables,
} from '__generated__/authRequestUtilsCreateUserMutation.graphql';
import {
  authRequestUtilsAddWalletMutation,
  authRequestUtilsAddWalletMutation$variables,
} from '__generated__/authRequestUtilsAddWalletMutation.graphql';

// TODO(Terence): Was there ever any optimistic update here?
export function useAddWalletMutation() {
  const [addWallet] = usePromisifiedMutation<authRequestUtilsAddWalletMutation>(graphql`
    mutation authRequestUtilsAddWalletMutation($address: Address!, $authMechanism: AuthMechanism!) {
      addUserAddress(address: $address, authMechanism: $authMechanism) {
        ... on AddUserAddressPayload {
          __typename
        }
      }
    }
  `);

  return useCallback(
    async ({ authMechanism, address }: authRequestUtilsAddWalletMutation$variables) => {
      const { addUserAddress } = await addWallet({
        variables: {
          address,
          authMechanism,
        },
      });

      if (addUserAddress?.__typename === 'AddUserAddressPayload') {
        return { signatureValid: true };
      } else {
        // TODO(Terence): We can probably have better error handling here.

        return { signatureValid: false };
      }
    },
    [addWallet]
  );
}

export function useLoginOrCreateUserMutation() {
  const [login] = usePromisifiedMutation<authRequestUtilsLoginMutation>(
    graphql`
      mutation authRequestUtilsLoginMutation($mechanism: AuthMechanism!) {
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
          ... on ErrDoesNotOwnRequiredNFT {
            message
          }
        }
      }
    `
  );

  const [createUser] = usePromisifiedMutation<authRequestUtilsCreateUserMutation>(
    graphql`
      mutation authRequestUtilsCreateUserMutation($mechanism: AuthMechanism!) {
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
          ... on ErrDoesNotOwnRequiredNFT {
            message
          }
        }
      }
    `
  );

  type LoginOrCreateUserInput =
    | {
        variables: authRequestUtilsCreateUserMutation$variables;
        userExists: false;
      }
    | { variables: authRequestUtilsLoginMutation$variables; userExists: true };

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

/**
 * Retrieve a nonce for the client to sign given a wallet address.
 * Endpoint will also notify whether the user exists or not, so the
 * client can login or signup accordingly
 */
type NonceResponse = {
  nonce: string;
  user_exists: boolean;
};

export function useCreateNonceMutation() {
  const [createNonce] = usePromisifiedMutation<authRequestUtilsCreateNonceMutation>(
    graphql`
      mutation authRequestUtilsCreateNonceMutation($address: Address!) {
        getAuthNonce(address: $address) {
          __typename

          ... on AuthNonce {
            userExists @required(action: THROW)
            nonce @required(action: THROW)
          }

          ... on ErrDoesNotOwnRequiredNFT {
            message
          }
        }
      }
    `
  );

  return useCallback(
    async (address: string): Promise<NonceResponse> => {
      // Kick off the mutation network request
      //
      // This call can throw an error. This error is the equivalent
      // of either a 500, or a network error (the user didn't have connection)
      //
      // If this throws, we'll just let the UI handle that appropriately
      // with it's try catch
      const { getAuthNonce } = await createNonce({
        variables: { address },
      });

      // If the server didn't give us a payload for the mutation we just committed,
      // we'll throw an error with a somewhat helpful message. This usually means
      // the server panicked at some point in the stack and was unable to commit
      // the mutation.
      if (!getAuthNonce) {
        throw new Error('getAuthNonce failed to execute. response data missing');
      }

      // The types generated by Relay let us do some great TypeScript
      // union checks here. Inside of this if, we'll have narrowed the
      // the type down to be the ErrDoesNotOwnRequiredNFT type so we
      // can access the relevant fields.
      if (getAuthNonce?.__typename === 'ErrDoesNotOwnRequiredNFT') {
        const errorWithCode: Web3Error = {
          name: getAuthNonce.__typename,
          code: 'GALLERY_SERVER_ERROR',
          message: getAuthNonce.message,
        };

        throw errorWithCode;
      }

      // Same thing here. If the response's typename is AuthNonce
      // that means the type has a nonce, and userExists field
      if (getAuthNonce?.__typename === 'AuthNonce') {
        return { nonce: getAuthNonce.nonce, user_exists: getAuthNonce.userExists };
      }

      // The server added some new type to the union and we don't know what to do.
      throw new Error(
        `Unexpected type returned from createNonceMutation: ${getAuthNonce.__typename}`
      );
    },
    [createNonce]
  );
}

/**
 * Add address to user
 */
type AddUserAddressRequest = {
  signature?: string;
  address: string;
  nonce?: string;
  wallet_type?: number;
};

type AddUserAddressResponse = {
  signature_valid: boolean;
};

async function addUserAddress(
  body: AddUserAddressRequest,
  fetcher: FetcherType
): Promise<AddUserAddressResponse> {
  try {
    return await fetcher<AddUserAddressResponse>(
      '/users/update/addresses/add',
      'add user address',
      {
        body,
      }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('error while attempting adding user address', error);
      throw { code: 'GALLERY_SERVER_ERROR', ...error } as Web3Error;
    }

    throw new Error('unknown error');
  }
}

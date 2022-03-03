import { FetcherType } from 'contexts/swr/useFetcher';
import { Web3Error } from 'types/Error';
import capitalize from 'utils/capitalize';
import Mixpanel from 'utils/mixpanel';
import { graphql } from 'relay-runtime';
import { authRequestUtilsCreateNonceMutation } from '../../../__generated__/authRequestUtilsCreateNonceMutation.graphql';
import { useCallback } from 'react';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import {
  authRequestUtilsLoginMutation,
  authRequestUtilsLoginMutation$variables,
} from '../../../__generated__/authRequestUtilsLoginMutation.graphql';
import {
  authRequestUtilsCreateUserMutation,
  authRequestUtilsCreateUserMutation$variables,
} from '../../../__generated__/authRequestUtilsCreateUserMutation.graphql';

export async function addWallet(payload: AddUserAddressRequest, fetcher: FetcherType) {
  const response = await addUserAddress(payload, fetcher);

  return { signatureValid: response.signature_valid };
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

  return useCallback(
    async ({
      variables,
      userExists,
    }:
      | {
          variables: authRequestUtilsCreateUserMutation$variables;
          userExists: false;
        }
      | { variables: authRequestUtilsLoginMutation$variables; userExists: true }): Promise<{
      user_id: string;
    }> => {
      if (userExists) {
        const { login: result } = await login({
          variables,
        });

        if (!result) {
          throw new Error('login failed to execute. response data missing');
        }

        if (result.__typename === 'LoginPayload') {
          return { user_id: result.userId };
        }

        if (result && 'message' in result) {
          throw new Error(result.message);
        }

        throw new Error(`Unexpected type returned from login mutation: ${result?.__typename}`);
      } else {
        Mixpanel.track('Create user');
        const { createUser: result } = await createUser({ variables });

        if (!result) {
          throw new Error('createUser failed to execute. response data missing');
        }

        if (result.__typename === 'CreateUserPayload') {
          return { user_id: result.userId };
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
      mutation authRequestUtilsCreateNonceMutation($address: String!) {
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
      const { getAuthNonce } = await createNonce({
        variables: { address },
      });

      if (!getAuthNonce) {
        throw new Error('getAuthNonce failed to execute. response data missing');
      }

      if (getAuthNonce?.__typename === 'ErrDoesNotOwnRequiredNFT') {
        const errorWithCode: Web3Error = {
          name: getAuthNonce.__typename,
          code: 'GALLERY_SERVER_ERROR',
          message: getAuthNonce.message,
        };

        throw errorWithCode;
      }

      if (getAuthNonce?.__typename === 'AuthNonce') {
        return { nonce: getAuthNonce.nonce, user_exists: getAuthNonce.userExists };
      }

      // We didn't handle a type
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

/**
 * Remove address from user
 */
type RemoveUserAddressRequest = {
  addresses: string[];
};

// eslint-disable-next-line @typescript-eslint/ban-types
type RemoveUserAddressResponse = {};

export async function removeUserAddress(
  body: RemoveUserAddressRequest,
  fetcher: FetcherType
): Promise<RemoveUserAddressResponse> {
  try {
    return await fetcher<RemoveUserAddressRequest>(
      '/users/update/addresses/remove',
      'remove user address',
      {
        body,
      }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('error while attempting remove user address', error);
      throw { code: 'GALLERY_SERVER_ERROR', ...error } as Web3Error;
    }

    throw new Error('unknown error');
  }
}

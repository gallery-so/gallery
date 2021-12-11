import { FetcherType } from 'contexts/swr/useFetcher';
import { OpenseaSyncResponse } from 'hooks/api/nfts/useOpenseaSync';
import { Web3Error } from 'types/Error';
import capitalize from 'utils/capitalize';
import { USER_SIGNUP_ENABLED } from 'utils/featureFlag';
import Mixpanel from 'utils/mixpanel';

export async function addWallet(payload: AddUserAddressRequest, fetcher: FetcherType) {
  const response = await addUserAddress(payload, fetcher);

  await triggerOpenseaSync(fetcher);

  return { signatureValid: response.signature_valid };
}

export async function loginOrCreateUser(
  userExists: boolean,
  payload: LoginUserRequest | CreateUserRequest,
  fetcher: FetcherType
) {
  if (userExists) {
    const response = await loginUser(payload as LoginUserRequest, fetcher);
    return { jwt: response.jwt_token, userId: response.user_id };
  }

  if (!USER_SIGNUP_ENABLED) {
    throw { code: 'USER_SIGNUP_DISABLED' } as Web3Error;
  }

  const response = await createUser(payload as CreateUserRequest, fetcher);

  // The user's nfts should be fetched here so that they're ready to go by the time
  // they arrive at the Create First Collection step
  await triggerOpenseaSync(fetcher, response.jwt_token);

  return { jwt: response.jwt_token, userId: response.user_id };
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

export async function fetchNonce(address: string, fetcher: FetcherType): Promise<NonceResponse> {
  try {
    return await fetcher<NonceResponse>(`/auth/get_preflight?address=${address}`, 'fetch nonce');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('error while retrieving nonce', error);
      const errorWithCode: Web3Error = {
        ...error,
        code: 'GALLERY_SERVER_ERROR',
        message: capitalize(error.message),
      };
      throw errorWithCode;
    }

    throw new Error('Unknown error');
  }
}

/**
 * Log in user with signature if user already exists
 */
type LoginUserRequest = {
  signature?: string;
  address: string;
  wallet_type: number;
};

type LoginUserResponse = {
  sig_valid: boolean;
  jwt_token: string;
  user_id: string;
};

async function loginUser(body: LoginUserRequest, fetcher: FetcherType): Promise<LoginUserResponse> {
  try {
    return await fetcher<LoginUserResponse>('/users/login', 'log in user', {
      body,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('error while attempting user login', error);
      const errorWithCode: Web3Error = {
        code: 'GALLERY_SERVER_ERROR',
        ...error,
      };
      throw errorWithCode;
    }

    throw new Error('Unknown error');
  }
}

/**
 * Add address to user
 */
type AddUserAddressRequest = {
  signature?: string;
  address: string;
  nonce: string;
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

/**
 * Create user with signature if user doesn't exist yet
 */
type CreateUserRequest = {
  signature?: string;
  address: string;
  nonce: string;
  wallet_type: number;
};

type CreateUserResponse = {
  sig_valid: boolean;
  jwt_token: string;
  user_id: string;
};

async function createUser(
  body: CreateUserRequest,
  fetcher: FetcherType
): Promise<CreateUserResponse> {
  try {
    const result = await fetcher<CreateUserResponse>('/users/create', 'create user', {
      body,
    });
    Mixpanel.track('Create user', { address: body.address });
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('error while attempting user creation', error);
      const errorWithCode: Web3Error = {
        code: 'GALLERY_SERVER_ERROR',
        ...error,
      };
      throw errorWithCode;
    }

    throw new Error('Unknown error');
  }
}

async function triggerOpenseaSync(fetcher: FetcherType, jwt?: string) {
  try {
    const headers = jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined;
    let payload = { body: {} };
    if (headers) {
      payload = { ...payload, ...headers };
    }

    await fetcher<OpenseaSyncResponse>('/nfts/opensea/refresh', 'refresh and sync nfts', payload);
    await fetcher<OpenseaSyncResponse>('/nfts/opensea/get', 'fetch and sync nfts', headers);
  } catch (error: unknown) {
    // Error silently; TODO: send error analytics
    console.error(error);
  }
}

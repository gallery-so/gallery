import { JsonRpcSigner } from '@ethersproject/providers';
import { FetcherType } from 'contexts/swr/useFetcher';
import { OpenseaSyncResponse } from 'hooks/api/nfts/useOpenseaSync';
import { Web3Error } from 'types/Error';

/**
 * Auth Pipeline:
 * 1. Fetch nonce from server with provided wallet address
 * 2. Sign nonce with wallet (metamask / walletconnect / etc.)
 * 3a. If wallet exists, log user in
 * 3b. If wallet is new, sign user up
 */
type AuthPipelineProps = {
  address: string;
  signer: JsonRpcSigner;
  fetcher: FetcherType;
};

type AuthResult = {
  jwt: string;
  userId: string;
};

export default async function initializeAuthPipeline({
  address,
  signer,
  fetcher,
}: AuthPipelineProps): Promise<AuthResult> {
  const { nonce, user_exists: userExists } = await fetchNonce(address, fetcher);

  const signature = await signMessage(nonce, signer);

  if (userExists) {
    const response = await loginUser({ signature, address }, fetcher);
    return { jwt: response.jwt_token, userId: response.user_id };
  }

  const response = await createUser(
    {
      signature,
      address,
      nonce,
    },
    fetcher,
  );

  // The user's nfts should be fetched here so that they're ready to go by the time
  // they arrive at the Create First Collection step
  await triggerOpenseaSync(address, fetcher);

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

async function fetchNonce(
  address: string,
  fetcher: FetcherType,
): Promise<NonceResponse> {
  try {
    return await fetcher<NonceResponse>(
      `/auth/get_preflight?address=${address}`,
      'fetch nonce',
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('error while retrieving nonce', error);
      const errorWithCode: Web3Error = { code: 'GALLERY_SERVER_ERROR', ...error };
      throw errorWithCode;
    }

    throw new Error('Unknown error');
  }
}

/**
 * Once we receive a nonce from gallery servers, we'll ask the
 * client to sign it. The method will hang here until a signature
 * is provided or denied (example: Metamask pop-up)
 */
type Signature = string;

async function signMessage(
  nonce: string,
  signer: JsonRpcSigner,
): Promise<Signature> {
  try {
    return await signer.signMessage(nonce);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('error while signing message', error);
      const errorWithCode: Web3Error = { code: 'REJECTED_SIGNATURE', ...error };
      throw errorWithCode;
    }

    throw new Error('Unknown error');
  }
}

/**
 * Log in user with signature if user already exists
 */
type LoginUserRequest = {
  signature: string;
  address: string;
};

type LoginUserResponse = {
  sig_valid: boolean;
  jwt_token: string;
  user_id: string;
};

async function loginUser(
  body: LoginUserRequest,
  fetcher: FetcherType,
): Promise<LoginUserResponse> {
  try {
    return await fetcher<LoginUserResponse>('/users/login', 'log in user', {
      body,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('error while attempting user login', error);
      const errorWithCode: Web3Error = { code: 'GALLERY_SERVER_ERROR', ...error };
      throw errorWithCode;
    }

    throw new Error('Unknown error');
  }
}

/**
 * Create user with signature if user doesn't exist yet
 */
type CreateUserRequest = {
  signature: string;
  address: string;
  nonce: string;
};

type CreateUserResponse = {
  sig_valid: boolean;
  jwt_token: string;
  user_id: string;
};

async function createUser(
  body: CreateUserRequest,
  fetcher: FetcherType,
): Promise<CreateUserResponse> {
  try {
    return await fetcher<CreateUserResponse>('/users/create', 'create user', {
      body,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('error while attempting user creation', error);
      const errorWithCode: Web3Error = { code: 'GALLERY_SERVER_ERROR', ...error };
      throw errorWithCode;
    }

    throw new Error('Unknown error');
  }
}

async function triggerOpenseaSync(address: string, fetcher: FetcherType) {
  try {
    await fetcher<OpenseaSyncResponse>(
      `/nfts/opensea_get?address=${address}&skip_cache=true`,
      'fetch and sync nfts',
    );
  } catch (error: unknown) {
    // Error silently; TODO: send error analytics
    console.error(error);
  }
}

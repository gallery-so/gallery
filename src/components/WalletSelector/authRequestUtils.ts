import { JsonRpcSigner } from '@ethersproject/providers';
import { FetcherType } from 'contexts/swr/useFetcher';

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
    const res = await loginUser({ signature, address }, fetcher);
    return { jwt: res.jwt_token, userId: res.user_id };
  }

  const res = await createUser(
    {
      signature,
      address,
      nonce,
    },
    fetcher
  );
  return { jwt: res.jwt_token, userId: res.user_id };
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
  fetcher: FetcherType
): Promise<NonceResponse> {
  try {
    return await fetcher<NonceResponse>(
      `/auth/get_preflight?address=${address}`,
      'fetch nonce'
    );
  } catch (err) {
    console.error('error while retrieving nonce', err);
    err.code = 'GALLERY_SERVER_ERROR';
    throw err;
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
  signer: JsonRpcSigner
): Promise<Signature> {
  try {
    return await signer.signMessage(nonce);
  } catch (err) {
    console.error('error while signing message', err);
    err.code = 'REJECTED_SIGNATURE';
    throw err;
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
  fetcher: FetcherType
): Promise<LoginUserResponse> {
  try {
    return await fetcher<LoginUserResponse>('/users/login', 'log in user', {
      body,
    });
  } catch (err) {
    console.error('error while attempting user login', err);
    err.code = 'GALLERY_SERVER_ERROR';
    throw err;
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
  fetcher: FetcherType
): Promise<CreateUserResponse> {
  try {
    return await fetcher<CreateUserResponse>('/users/create', 'create user', {
      body,
    });
  } catch (err) {
    console.error('error while attempting user creation', err);
    err.code = 'GALLERY_SERVER_ERROR';
    throw err;
  }
}

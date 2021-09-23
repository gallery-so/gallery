import { JsonRpcSigner } from '@ethersproject/providers';

import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { FetcherType } from 'contexts/swr/useFetcher';
import { OpenseaSyncResponse } from 'hooks/api/nfts/useOpenseaSync';
import { Web3Error } from 'types/Error';

const USER_SIGNUP_ENABLED = true;

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
  connector: AbstractConnector;
};

type AuthResult = {
  jwt: string;
  userId: string;
};

export default async function initializeAuthPipeline({
  address,
  signer,
  fetcher,
  connector,
}: AuthPipelineProps): Promise<AuthResult> {
  const { nonce, user_exists: userExists } = await fetchNonce(address, fetcher);
  const signature = await signMessage(address, nonce, signer, connector);

  if (userExists) {
    const response = await loginUser({ signature, address }, fetcher);
    return { jwt: response.jwt_token, userId: response.user_id };
  }

  if (!USER_SIGNUP_ENABLED) {
    throw { code: 'USER_SIGNUP_DISABLED' } as Web3Error;
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

function isRpcSignatureError(error: Record<string, any>) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 4001;
}

async function signMessage(
  address: string,
  nonce: string,
  signer: JsonRpcSigner,
  connector: AbstractConnector,
): Promise<Signature> {
  try {
    if (connector instanceof WalletConnectConnector) {
      // This keeps the nonce message intact instead of encrypting it for WalletConnect users
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return await connector.walletConnectProvider.connector.signPersonalMessage([nonce, address]) as Signature;
    }

    return await signer.signMessage(nonce);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw { code: 'REJECTED_SIGNATURE', ...error } as Web3Error;
    } else if (error instanceof Object && isRpcSignatureError(error)) {
      throw { code: 'REJECTED_SIGNATURE' } as Web3Error;
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
  } catch (error: unknown) {
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

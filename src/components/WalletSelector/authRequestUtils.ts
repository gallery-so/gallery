import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';

import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { FetcherType } from 'contexts/swr/useFetcher';
import { OpenseaSyncResponse } from 'hooks/api/nfts/useOpenseaSync';
import { Web3Error } from 'types/Error';
import capitalize from 'utils/capitalize';
import { USER_SIGNUP_ENABLED } from 'utils/featureFlag';
import Mixpanel from 'utils/mixpanel';
import walletlinkSigner from './walletlinkSigner';
// todo rename 
import GNOSIS_SAFE_CONTRACT_ABI from 'abis/gnosis-safe-contract.json';

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
  library?: Web3Provider;
};

type AddWalletResult = {
  signatureValid: boolean;
};

export async function initializeAddWalletPipeline({
  address,
  signer,
  fetcher,
  connector,
  library
}: AuthPipelineProps): Promise<AddWalletResult> {
  // Check if address already belongs to a user in the database
  // If so, the user shouldn't be able to add the address. In the future we might allow user merge
  const { nonce, user_exists: userExists } = await fetchNonce(address, fetcher);

  if (userExists) {
    throw { code: 'EXISTING_USER' } as Web3Error;
  }

  const signature = await signMessage(address, nonce, signer, connector, library);
  const response = await addUserAddress({ signature, address }, fetcher);

  await triggerOpenseaSync(fetcher);

  return { signatureValid: response.signature_valid };
}

type AuthResult = {
  jwt: string;
  userId: string;
};

export default async function initializeAuthPipeline({
  address,
  signer,
  fetcher,
  connector
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
      const errorWithCode: Web3Error = { ...error, code: 'GALLERY_SERVER_ERROR', message: capitalize(error.message) };
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

// todo this will be diff for mainnet
const GNOSIS_SIGN_CONTRACT_ADDRESS = '0x60facecd4dbf14f1ae647afc3d1d071b1c29ace4'
async function signMessage(
  address: string,
  nonce: string,
  signer: JsonRpcSigner,
  connector: AbstractConnector,
  library?: Web3Provider,
): Promise<Signature> {
  try {
    if (connector instanceof WalletConnectConnector) {
      
      // This keeps the nonce message intact instead of encrypting it for WalletConnect users
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const signature = await connector.walletConnectProvider.connector.signPersonalMessage([nonce, address]) as Signature;
      // for gnosis, signature will always be 0x. see Notion for explanation

      // todo create separate signMessage func for gnosis/smart contracts.

      if (library){
        const gnosisContract = new Contract(GNOSIS_SIGN_CONTRACT_ADDRESS, GNOSIS_SAFE_CONTRACT_ABI, library as any)

        // ignore this line. this is just to test that we are able to call isValidSignature correctly. the msg argument is from a previous succesful SignMsg transaction
        const isValidSignature = await gnosisContract.isValidSignature('0x3df03ecd8626b1a26e90b64c0f7a2e7e4dc4789e6a1c346ee7b189a201031d7b', signature);
        console.log('isValidSignature', isValidSignature)
        
        // create listener that will listen for the SignMsg event on the Gnosis contract
        const listenForGnosis = new Promise((resolve, reject) => {          
          gnosisContract.on('SignMsg', async (msgHash:any, event: any, error: any) =>  {
            console.log('msgHash', msgHash)
            console.log('event', event)
            console.log('error', error)
            
            if (error) {
              reject(error)
            }
            
            // Upon detecing the SignMsg event, validate that the contract signed the message
            const isValidSignature = await gnosisContract.isValidSignature(msgHash, signature);
            // todo: is not valid, keep listening. it could be an event from a stale tx in the queue
            
            resolve(msgHash)
          })
        })

        console.log('start listen')
        await listenForGnosis
        console.log('after await')
      }

      return signature;
    }

    if (connector instanceof WalletLinkConnector) {
      return await walletlinkSigner({ connector, nonce, address });
    }

    return await signer.signMessage(nonce);
  } catch (error: unknown) {
    console.log(error)
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
 * Add address to user
 */
type AddUserAddressRequest = {
  signature: string;
  address: string;
};

type AddUserAddressResponse = {
  signature_valid: boolean;
};

async function addUserAddress(
  body: AddUserAddressRequest,
  fetcher: FetcherType,
): Promise<AddUserAddressResponse> {
  try {
    return await fetcher<AddUserAddressResponse>('/users/update/addresses/add', 'add user address', {
      body,
    });
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

type RemoveUserAddressResponse = {

};

export async function removeUserAddress(
  body: RemoveUserAddressRequest,
  fetcher: FetcherType,
): Promise<RemoveUserAddressResponse> {
  try {
    return await fetcher<RemoveUserAddressRequest>('/users/update/addresses/remove', 'remove user address', {
      body,
    });
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
    const result = await fetcher<CreateUserResponse>('/users/create', 'create user', {
      body,
    });
    Mixpanel.track('Create user', { 'address': body.address });
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('error while attempting user creation', error);
      const errorWithCode: Web3Error = { code: 'GALLERY_SERVER_ERROR', ...error };
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

    await fetcher<OpenseaSyncResponse>(
      '/nfts/opensea/refresh',
      'refresh and sync nfts',
      payload,
    );
    await fetcher<OpenseaSyncResponse>(
      '/nfts/opensea/get',
      'fetch and sync nfts',
      headers,
    );
  } catch (error: unknown) {
    // Error silently; TODO: send error analytics
    console.error(error);
  }
}

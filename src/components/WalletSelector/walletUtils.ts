import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import GNOSIS_SAFE_CONTRACT_ABI from 'abis/gnosis-safe-contract.json';
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { CONTRACT_ACCOUNT, EXTERNALLY_OWNED_ACCOUNT } from 'types/Wallet';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import walletlinkSigner from './walletlinkSigner';
import { Contract } from '@ethersproject/contracts';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { Web3Error } from 'types/Error';

// The hard coded value that Gnosis Safe contract's isValidSignature method returns if the message was signed
// https://github.com/gnosis/safe-contracts/blob/dec13f7cdab62056984343c4edfe40df5a1954dc6/contracts/handler/CompatibilityFallbackHandler.sol#L19
const GNOSIS_VALID_SIGNATURE_MAGIC_VALUE = '0x1626ba7e';
const GNOSIS_SAFE_SIGN_MESSAGE_EVENT_NAME = 'SignMsg';

type EthereumAccountType = typeof EXTERNALLY_OWNED_ACCOUNT | typeof CONTRACT_ACCOUNT;
type Signature = string;
// The contract accounts that Gallery supports (Gnosis, Argent, etc). ID is used by the backend to know which contract to call
type ContractAccount = { name: string; id: number };

// Externally Owned Accounts will always have Wallet Type ID = 0 because the backend will handle all EOAs the same way.
export const DEFAULT_WALLET_TYPE_ID = 0;
export const GNOSIS_SAFE_WALLET_TYPE_ID = 1;
// List of contract account wallets that Gallery supports. Used to detect if the user is trying to log in with a contract account
const SUPPORTED_CONTRACT_ACCOUNTS: [ContractAccount] = [
  { name: 'Gnosis Safe', id: GNOSIS_SAFE_WALLET_TYPE_ID },
];

/**
 * Checks what type of Ethereum account the wallet is and signs the message accordingly
 */
export async function signMessage(
  address: string,
  nonce: string,
  connector: AbstractConnector,
  signer: JsonRpcSigner,
  library?: Web3Provider
): Promise<Signature> {
  const accountType = getEthereumAccountType(connector);

  if (accountType === CONTRACT_ACCOUNT) {
    // TODO: if theres a nonce in local storage, prompt to try again

    return signMessageWithContractAccount(address, nonce, connector, library);
  }

  return signMessageWithEOA(address, nonce, signer, connector);
}

export async function signMessageWithEOA(
  address: string,
  nonce: string,
  signer: JsonRpcSigner,
  connector: AbstractConnector
): Promise<Signature> {
  try {
    if (connector instanceof WalletConnectConnector) {
      // This keeps the nonce message intact instead of encrypting it for WalletConnect users
      return (await connector.walletConnectProvider.connector.signPersonalMessage([
        nonce,
        address,
      ])) as Signature;
    }

    if (connector instanceof WalletLinkConnector) {
      return await walletlinkSigner({ connector, nonce, address });
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

export async function signMessageWithContractAccount(
  address: string,
  nonce: string,
  connector: AbstractConnector,
  library?: Web3Provider
): Promise<Signature> {
  try {
    if (!(connector instanceof WalletConnectConnector)) {
      throw new Error('WalletConnectConnector is required for Contract Accounts');
    }

    if (!library) {
      throw new Error('Web3Provider is required for Contract Accounts');
    }

    // This keeps the nonce message intact instead of encrypting it for WalletConnect users
    return (await connector.walletConnectProvider.connector.signPersonalMessage([
      nonce,
      address,
    ])) as Signature;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw { code: 'REJECTED_SIGNATURE', ...error } as Web3Error;
    } else if (error instanceof Object && isRpcSignatureError(error)) {
      throw { code: 'REJECTED_SIGNATURE' } as Web3Error;
    }

    throw new Error('Unknown error');
  }
}

export async function listenForGnosisSignature(
  address: string,
  nonce: string,
  library?: Web3Provider
) {
  const gnosisSafeContract = new Contract(address, GNOSIS_SAFE_CONTRACT_ABI, library as any);
  const messageHash = generateMessageHash(nonce);
  // create listener that will listen for the SignMsg event on the Gnosis contract
  const listenToGnosisSafeContract = new Promise((resolve) => {
    gnosisSafeContract.on(GNOSIS_SAFE_SIGN_MESSAGE_EVENT_NAME, async (msgHash: any) => {
      // Upon detecing the SignMsg event, validate that the contract signed the message
      const magicValue = await gnosisSafeContract.isValidSignature(messageHash, '0x');
      const messageWasSigned = magicValue === GNOSIS_VALID_SIGNATURE_MAGIC_VALUE;

      if (messageWasSigned) {
        resolve(msgHash);
      }

      // If the message was not signed, keep listening without throwing an error.
      // It's possible that we detected a SignMsg event from an older tx in the queue, since Gnosis requires all txs in its queue to be processed
      // We will keep listening for the event until we detect that the message was signed
    });
  });

  await listenToGnosisSafeContract;
}

// Determines if the account is an EOA or a Contract Account
function getEthereumAccountType(connector: AbstractConnector): EthereumAccountType {
  // Currently we only support CONTRACT_ACCOUNT via WalletConnect so if it's a different connector, automatically use EOA
  if (!(connector instanceof WalletConnectConnector)) {
    return EXTERNALLY_OWNED_ACCOUNT;
  }

  const contractAccount = checkIfContractAccount(connector);

  if (contractAccount) {
    return CONTRACT_ACCOUNT;
  }

  return EXTERNALLY_OWNED_ACCOUNT;
}

// Checks if the wallet is one of the supported contract account types. If so, return the matching ContractAccount object.
// Otherwise returns null
function checkIfContractAccount(connector: WalletConnectConnector): ContractAccount | null {
  const walletName = connector.walletConnectProvider?.wc?.peerMeta?.name;

  if (!walletName) {
    return null;
  }

  const contractAccount = SUPPORTED_CONTRACT_ACCOUNTS.find((contractAccount: ContractAccount) =>
    walletName.startsWith(contractAccount.name)
  );

  // If the wallet name doesn't match any supported contract accounts, it is either an EOA or we don't support it yet
  if (!contractAccount) {
    return null;
  }

  return contractAccount;
}

// Gets the Wallet Type ID for a given wallet connection
// Wallet Type ID is a Gallery-specific ID that the backend uses to differentiate between contract accounts such as Gnosis vs Argent
export function getWalletTypeId(connector: AbstractConnector) {
  if (!(connector instanceof WalletConnectConnector)) {
    return DEFAULT_WALLET_TYPE_ID;
  }

  const contractAccount = checkIfContractAccount(connector);

  if (!contractAccount) {
    return DEFAULT_WALLET_TYPE_ID;
  }

  return contractAccount.id;
}

function isRpcSignatureError(error: Record<string, any>) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 4001;
}

// Generates the same message hash that is generated by the Wallet Connect personal sign method after the user sees the nonce message
// This is the same value that is passed into the wallet's sign method
function generateMessageHash(nonce: string) {
  const prependedNonce = `\x19Ethereum Signed Message:\n${nonce.length}${nonce}`;
  return keccak256(toUtf8Bytes(prependedNonce));
}

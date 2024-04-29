import { getContract } from '@wagmi/core';
import { Abi, GetContractReturnType } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

import { GALLERY_MEMENTOS_CONTRACT_ABI } from '~/abis/galleryMementosContractAbi';
import { GALLERY_MERCH_CONTRACT_ABI } from '~/abis/galleryMerchContractAbi';
import { GENERAL_MEMBERSHIP_CONTRACT_ABI } from '~/abis/generalMembershipContractAbi';
import { PREMIUM_MEMBERSHIP_CONTRACT_ABI } from '~/abis/premiumMembershipContractAbi';

export const PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS ?? '';
export const GENERAL_MEMBERSHIP_CONRTACT_ADDRESS =
  process.env.NEXT_PUBLIC_GENERAL_MEMBERSHIP_CONTRACT_ADDRESS ?? '';
export const GALLERY_MEMENTOS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GALLERY_MEMENTOS_BASE_CONTRACT_ADDRESS ?? '';
export const GALLERY_MERCH_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GALLERY_MERCH_CONTRACT_ADDRESS ?? '';

type EthereumAddress = `0x${string}`;

// getContract() from wagmi is strict about the address format
function validateEthereumAddressFormat(input: string): EthereumAddress {
  if (!input.match(/^0x[a-fA-F0-9]+$/)) {
    throw new Error('Invalid input!');
  }

  return input as EthereumAddress;
}

// Newer versions of wagmi use viem to interact with contracts, while our codebase uses ethers.
// To avoid a refactor now, whenever we interact with the contract, we're still using the legacy `write` and `read` properties
// from the contract which allows us to call the abi methods directly.
// This isn't ideal because getContract() returns a viem Contract instance whose type doesnt include `write` and `read` properties.
// The WagmiContract type is a workaround to satisfy typecheck and allow us to use the `write` and `read` properties without needing to ignore typescript errors everywhere we use the contract.
// TODO: refactor contract interactions to use viem syntax https://viem.sh/docs/contract/readContract.html

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WagmiContract = GetContractReturnType<Abi> & { write?: any; read?: any };

/**
 * This function is heavily outdated and needs to be updated; `getContract` API has been updated.
 * We haven't prioritized fixing this since we don't really do anything with contracts anymore
 */
function useContractWithAbi_WARNING_THIS_FUNCTION_DOESNT_WORK(
  contractAddress: string,
  contractAbi: Abi,
  chainId?: number
): WagmiContract {
  const validatedAddress = validateEthereumAddressFormat(contractAddress);
  const chainIdInt = chainId ?? parseInt(process.env.NEXT_PUBLIC_NETWORK_CONNECTOR_CHAIN_ID || '1');

  const { data: walletClient } = useWalletClient({
    chainId: chainIdInt,
  });
  const abi = [...contractAbi] as const;
  const publicClient = usePublicClient();

  const contract = getContract({
    // @ts-expect-error: not fixing this until we need to
    address: validatedAddress,
    abi,
    // @ts-expect-error typescript
    walletClient: walletClient ?? publicClient,
  });

  // @ts-expect-error: not fixing this until we need to
  return contract;
}

export function useMintMerchContract() {
  return useContractWithAbi_WARNING_THIS_FUNCTION_DOESNT_WORK(
    GALLERY_MERCH_CONTRACT_ADDRESS,
    GALLERY_MERCH_CONTRACT_ABI as Abi
  );
}

export function usePremiumMembershipCardContract() {
  return useContractWithAbi_WARNING_THIS_FUNCTION_DOESNT_WORK(
    PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS,
    PREMIUM_MEMBERSHIP_CONTRACT_ABI as Abi
  );
}

export function useGeneralMembershipCardContract() {
  return useContractWithAbi_WARNING_THIS_FUNCTION_DOESNT_WORK(
    GENERAL_MEMBERSHIP_CONRTACT_ADDRESS,
    GENERAL_MEMBERSHIP_CONTRACT_ABI as Abi
  );
}

export const BASE_MAINNET_CHAIN_ID = 8453;

export function useMintMementosContract() {
  return useContractWithAbi_WARNING_THIS_FUNCTION_DOESNT_WORK(
    GALLERY_MEMENTOS_CONTRACT_ADDRESS,
    GALLERY_MEMENTOS_CONTRACT_ABI as Abi,
    BASE_MAINNET_CHAIN_ID
  );
}

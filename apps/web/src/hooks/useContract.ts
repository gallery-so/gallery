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
  process.env.NEXT_PUBLIC_GALLERY_MEMENTOS_CONTRACT_ADDRESS ?? '';
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

function useContractWithAbi(
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
    address: validatedAddress,
    abi,
    // @ts-expect-error typescript
    walletClient: walletClient ?? publicClient,
  });

  return contract;
}

export function useMintMerchContract() {
  return useContractWithAbi(GALLERY_MERCH_CONTRACT_ADDRESS, GALLERY_MERCH_CONTRACT_ABI as Abi);
}

export function usePremiumMembershipCardContract() {
  return useContractWithAbi(
    PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS,
    PREMIUM_MEMBERSHIP_CONTRACT_ABI as Abi
  );
}

export function useGeneralMembershipCardContract() {
  return useContractWithAbi(
    GENERAL_MEMBERSHIP_CONRTACT_ADDRESS,
    GENERAL_MEMBERSHIP_CONTRACT_ABI as Abi
  );
}

export const BASE_MAINNET_CHAIN_ID = 8453;

export function useMintMementosContract() {
  return useContractWithAbi(
    GALLERY_MEMENTOS_CONTRACT_ADDRESS,
    GALLERY_MEMENTOS_CONTRACT_ABI as Abi,
    BASE_MAINNET_CHAIN_ID
  );
}

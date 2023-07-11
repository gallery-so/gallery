import { getContract } from '@wagmi/core';
import { GetContractReturnType } from 'viem';
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

function useContractWithAbi(contractAddress: string, contractAbi: object[]): GetContractReturnType {
  const validatedAddress = validateEthereumAddressFormat(contractAddress);
  const chainId = parseInt(process.env.NEXT_PUBLIC_NETWORK_CONNECTOR_CHAIN_ID || '1');
  const { data: walletClient } = useWalletClient({
    chainId,
  });

  const publicClient = usePublicClient();

  const contract = getContract({
    address: validatedAddress,
    abi: contractAbi,
    // @ts-expect-error typescript
    walletClient: walletClient ?? publicClient,
  });

  // @ts-expect-error typescript
  return contract;
}

export function useMintMerchContract() {
  return useContractWithAbi(GALLERY_MERCH_CONTRACT_ADDRESS, GALLERY_MERCH_CONTRACT_ABI);
}

export function usePremiumMembershipCardContract() {
  return useContractWithAbi(PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS, PREMIUM_MEMBERSHIP_CONTRACT_ABI);
}

export function useGeneralMembershipCardContract() {
  return useContractWithAbi(GENERAL_MEMBERSHIP_CONRTACT_ADDRESS, GENERAL_MEMBERSHIP_CONTRACT_ABI);
}

export function useMintMementosContract() {
  return useContractWithAbi(GALLERY_MEMENTOS_CONTRACT_ADDRESS, GALLERY_MEMENTOS_CONTRACT_ABI);
}

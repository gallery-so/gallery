import PREMIUM_MEMBERSHIP_CONTRACT_ABI from 'abis/premium-membership-contract.json';
import GENERAL_MEMBERSHIP_CONTRACT_ABI from 'abis/general-membership-contract.json';
import GALLERY_MEMENTOS_CONTRACT_ABI from 'abis/gallery-mementos-contract.json';
import { ContractInterface } from '@ethersproject/contracts';
import GALLERY_MERCH_CONTRACT_ABI from 'abis/gallery-merch-contract.json';
import { useSigner, useContract, useProvider } from 'wagmi';

export const PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS ?? '';
export const GENERAL_MEMBERSHIP_CONRTACT_ADDRESS =
  process.env.NEXT_PUBLIC_GENERAL_MEMBERSHIP_CONTRACT_ADDRESS ?? '';
export const GALLERY_MEMENTOS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GALLERY_MEMENTOS_CONTRACT_ADDRESS ?? '';
export const GALLERY_MERCH_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GALLERY_MERCH_CONTRACT_ADDRESS ?? '';

function useContractWithAbi(contractAddress: string, contractAbi: ContractInterface) {
  const { data: signer } = useSigner();
  const chainId = parseInt(process.env.NEXT_PUBLIC_NETWORK_CONNECTOR_CHAIN_ID || '1');
  const provider = useProvider({ chainId: chainId });

  return useContract({
    addressOrName: contractAddress,
    contractInterface: contractAbi,
    signerOrProvider: signer ?? provider,
  });
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

export function useMintPosterContract() {
  return useContractWithAbi(GALLERY_MEMENTOS_CONTRACT_ADDRESS, GALLERY_MEMENTOS_CONTRACT_ABI);
}

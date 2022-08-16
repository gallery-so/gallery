// import { Contract } from '@ethersproject/contracts';
// import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
// import { useMemo } from 'react';
import PREMIUM_MEMBERSHIP_CONTRACT_ABI from 'abis/premium-membership-contract.json';
import GENERAL_MEMBERSHIP_CONTRACT_ABI from 'abis/general-membership-contract.json';
import GALLERY_MEMENTOS_CONTRACT_ABI from 'abis/gallery-mementos-contract.json';
import { ContractInterface } from '@ethersproject/contracts';
import GALLERY_MERCH_CONTRACT_ABI from 'abis/gallery-merch-contract.json';
// import { network } from 'connectors/index';
// import { useActiveWeb3React } from './useWeb3';
import {
  // useAccount, useNetwork,
  useSigner,
  useContract,
  useProvider,
} from 'wagmi';

export const PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS ?? '';
export const GENERAL_MEMBERSHIP_CONRTACT_ADDRESS =
  process.env.NEXT_PUBLIC_GENERAL_MEMBERSHIP_CONTRACT_ADDRESS ?? '';
export const GALLERY_MEMENTOS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GALLERY_MEMENTOS_CONTRACT_ADDRESS ?? '';
export const GALLERY_MERCH_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GALLERY_MERCH_CONTRACT_ADDRESS ?? '';

// account is not optional
// function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
//   return library.getSigner(account).connectUnchecked();
// }

// account is optional
// function getProviderOrSigner(
//   library: Web3Provider,
//   account?: string
// ): JsonRpcSigner | Web3Provider {
//   console.log('SIGNER:', account, library);
//   return account ? getSigner(library, account) : library;
// }

// account is optional
// function getContract(address: string, ABI: any, library: Web3Provider, account?: string) {
//   return new Contract(address, ABI, getProviderOrSigner(library, account));
// }

// function useContract(address: string, abi: any) {
//   const { library, account, activate } = useActiveWeb3React();
//   // console.log(library, account, activate);
//   console.log('ACCOUNT FROM useActiveWeb3React', account);

//   const { address: rawUserAddress } = useAccount();
//   const userAddress = rawUserAddress?.toLowerCase();
//   console.log('ADDRESS FROM useAccount', userAddress);

//   const accountToUse = account || userAddress;
//   console.log('Using address', accountToUse);

//   if (!library) {
//     // activate provider without an address to be able to read from contracts
//     void activate(network);
//   }

//   return useMemo(() => {
//     if (!address || !library) {
//       return null;
//     }

//     try {
//       return getContract(address, abi, library, accountToUse ? accountToUse : undefined);
//     } catch {
//       console.error('Error getting contract');
//       return null;
//     }
//   }, [abi, address, library, accountToUse]);
// }

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

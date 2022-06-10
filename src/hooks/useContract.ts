import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { useMemo } from 'react';
import PREMIUM_MEMBERSHIP_CONTRACT_ABI from 'abis/premium-membership-contract.json';
import GENERAL_MEMBERSHIP_CONTRACT_ABI from 'abis/general-membership-contract.json';
import GALLERY_MEMENTOS_CONTRACT_ABI from 'abis/gallery-mementos-contract.json';
import { network } from 'connectors/index';
import { useActiveWeb3React } from './useWeb3';

export const PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS;
export const GENERAL_MEMBERSHIP_CONRTACT_ADDRESS =
  process.env.NEXT_PUBLIC_GENERAL_MEMBERSHIP_CONTRACT_ADDRESS;
export const GALLERY_MEMENTOS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GALLERY_MEMENTOS_CONTRACT_ADDRESS;

// account is not optional
function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
function getProviderOrSigner(
  library: Web3Provider,
  account?: string
): JsonRpcSigner | Web3Provider {
  return account ? getSigner(library, account) : library;
}

// account is optional
function getContract(address: string, ABI: any, library: Web3Provider, account?: string) {
  return new Contract(address, ABI, getProviderOrSigner(library, account));
}

function useContract(address: string, abi: any) {
  const { library, account, activate } = useActiveWeb3React();

  if (!library) {
    // activate provider without an address to be able to read from contracts
    void activate(network);
  }

  return useMemo(() => {
    if (!address || !library) {
      return null;
    }

    try {
      return getContract(address, abi, library, account ? account : undefined);
    } catch {
      console.error('Error getting contract');
      return null;
    }
  }, [abi, account, address, library]);
}

export function usePremiumMembershipCardContract() {
  return useContract(PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS || '', PREMIUM_MEMBERSHIP_CONTRACT_ABI);
}

export function useGeneralMembershipCardContract() {
  return useContract(GENERAL_MEMBERSHIP_CONRTACT_ADDRESS || '', GENERAL_MEMBERSHIP_CONTRACT_ABI);
}

export function useMintPosterContract() {
  return useContract(GALLERY_MEMENTOS_CONTRACT_ADDRESS || '', GALLERY_MEMENTOS_CONTRACT_ABI);
}

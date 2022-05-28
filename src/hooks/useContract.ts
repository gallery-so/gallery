import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { useMemo } from 'react';
import PREMIUM_MEMBERSHIP_CONTRACT_ABI from 'abis/premium-membership-contract.json';
import GENERAL_MEMBERSHIP_CONTRACT_ABI from 'abis/general-membership-contract.json';
import GALLERY_MEMORABILIA_CONTRACT_ABI from 'abis/gallery-memorabilia-contract.json';
import { network } from 'connectors/index';
import { useActiveWeb3React } from './useWeb3';

export const PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS = '0xe01569ca9b39E55Bc7C0dFa09F05fa15CB4C7698';
export const GENERAL_MEMBERSHIP_CONRTACT_ADDRESS = '0x989Cb023620Cec6798161EcA6C7eccFf68C0C9c3';

// rinkeby
export const POSTER_PAGE_CONTRACT_ADDRESS = '0xe956Fe011432CD0Edbb52865c7437744bEF1508b';

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
  return useContract(PREMIUM_MEMBERSHIP_CONTRACT_ADDRESS, PREMIUM_MEMBERSHIP_CONTRACT_ABI);
}

export function useGeneralMembershipCardContract() {
  return useContract(GENERAL_MEMBERSHIP_CONRTACT_ADDRESS, GENERAL_MEMBERSHIP_CONTRACT_ABI);
}

export function useMintPosterContract() {
  return useContract(POSTER_PAGE_CONTRACT_ADDRESS, GALLERY_MEMORABILIA_CONTRACT_ABI);
}

import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { useMemo } from 'react';
import ABI from 'abis/invite-1155.json';
import { network } from 'connectors/index';
import { useActiveWeb3React } from './useWeb3';

export const MEMBERSHIP_CONTRACT_ADDRESS = '0xe01569ca9b39E55Bc7C0dFa09F05fa15CB4C7698';

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

function useContract(address: string) {
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
      return getContract(address, ABI, library, account ? account : undefined);
    } catch {
      console.error('Error getting contract');
      return null;
    }
  }, [account, address, library]);
}

export function useMembershipCardContract() {
  return useContract(MEMBERSHIP_CONTRACT_ADDRESS);
}

import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import ABI from 'abis/invite-1155.json';

// RINKEBY address
const CONTRACT_ADDRESS = '0x7562bbbCD288d23E9aCEA1a2af36Ecf926bdD9e5';

type Props = {
  address: string;
};

// account is not optional
function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

function getContract(address: string, ABI: any, library: Web3Provider, account: string) {
  return new Contract(address, ABI, getSigner(library, account) as any);
}

function useContract(address: string) {
  const { library, account } = useWeb3React<Web3Provider>();

  return useMemo(() => {
    if (!address || !library || !account) {
      return null;
    }

    try {
      return getContract(address, ABI, library, account);
    } catch {
      console.error('Error getting contract');
      return null;
    }
  }, [account, address, library]);
}

export function useMembershipCardContract() {
  return useContract(CONTRACT_ADDRESS);
}

// export default useContract;

import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import web3 from 'web3';

import { useMintMerchContract } from '~/hooks/useContract';

import { merchItems, MerchItemTypes } from '../MerchStorePage';
export default function useMerchRedemption() {
  const contract = useMintMerchContract();
  const { address } = useAccount();

  const [userItems, setUserItems] = useState<MerchItemTypes[]>([]);

  const fetchUserItems = useCallback(async () => {
    const userItems = <MerchItemTypes[]>[];

    await Promise.all(
      merchItems.map(async (item) => {
        const balance = await contract.balanceOfType(item.tokenId, address);
        const total = web3.utils.hexToNumber(balance);
        for (let i = 0; i < total; i++) {
          userItems.push(item);
        }
      })
    );
    setUserItems(userItems);
  }, [address, contract]);

  useEffect(() => {
    async function effect() {
      await fetchUserItems();
    }
    effect();
    return () => {};
  }, [fetchUserItems]);

  return {
    userItems,
  };
}

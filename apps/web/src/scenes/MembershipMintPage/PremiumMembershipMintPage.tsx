import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState } from 'react';

import {
  useMembershipMintPageActions,
  useMembershipMintPageState,
} from '~/contexts/membershipMintPage/MembershipMintPageContext';
import { usePremiumMembershipCardContract } from '~/hooks/useContract';
import { MembershipMintPage } from '~/scenes/MembershipMintPage/MembershipMintPage';

import { MembershipNft } from './cardProperties';

type Props = {
  membershipNft: MembershipNft;
};

function PremiumMembershipMintPage({ membershipNft }: Props) {
  const { account } = useWeb3React<Web3Provider>();
  const contract = usePremiumMembershipCardContract();

  const [canMintToken, setCanMintToken] = useState(false);
  const { price } = useMembershipMintPageState();
  const { getPrice, getSupply } = useMembershipMintPageActions();

  // check the contract whether the user's address is allowed to call mint, and set the result in local state
  const getCanMintToken = useCallback(
    async (contract: Contract) => {
      if (account) {
        const canMintTokenResult = await contract.read.canMintToken([
          account,
          membershipNft.tokenId,
        ]);
        setCanMintToken(canMintTokenResult);
      }
    },
    [account, membershipNft.tokenId]
  );

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number) =>
      contract.write.mint([account, tokenId], { value: price }),
    [account, price]
  );

  const onMintSuccess = useCallback(async () => {
    if (contract) {
      void getCanMintToken(contract);
    }
  }, [contract, getCanMintToken]);

  useEffect(() => {
    if (contract) {
      void getCanMintToken(contract);
      getSupply(contract, membershipNft.tokenId);
      getPrice(contract, membershipNft.tokenId);
    }
  }, [getCanMintToken, contract, getPrice, getSupply, membershipNft.tokenId]);

  return (
    <MembershipMintPage
      membershipNft={membershipNft}
      canMintToken={canMintToken}
      contract={contract}
      mintToken={mintToken}
      onMintSuccess={onMintSuccess}
    />
  );
}

export default PremiumMembershipMintPage;

import { Web3Provider } from '@ethersproject/providers';
import { MembershipMintPage } from 'scenes/MembershipMintPage/MembershipMintPage';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  GENERAL_MEMBERSHIP_CONRTACT_ADDRESS,
  useGeneralMembershipCardContract,
} from 'hooks/useContract';

import MerkleTree from './MerkleTree';
import { Contract } from '@ethersproject/contracts';

import MembershipMintPageProvider, {
  useMembershipMintPageActions,
} from 'contexts/membershipMintPage/MembershipMintPageContext';
import { MEMBERSHIP_NFT_GENERAL } from './cardProperties';

export type AssetContract = {
  address: string;
};

export type OpenseaAsset = {
  asset_contract: AssetContract;
};

const OPENSEA_API_BASEURL = process.env.NEXT_PUBLIC_OPENSEA_API_BASEURL ?? 'https://api.opensea.io';

const allowList = ['0xtest'];

function generateMerkleProof(address: string) {
  const merkleTree = new MerkleTree(allowList);
  return merkleTree.getHexProof(address);
}

async function detectOwnedGeneralCardsFromOpensea(account: string) {
  const response = await fetch(
    `${OPENSEA_API_BASEURL}/api/v1/assets?owner=${account}&asset_contract_addresses=${GENERAL_MEMBERSHIP_CONRTACT_ADDRESS}`,
    {}
  );

  const responseBody = await response.json();
  return responseBody.assets.length > 0;
}

function PartnerMembershipMintPageContent() {
  const { account } = useWeb3React<Web3Provider>();
  const contract = useGeneralMembershipCardContract();

  const { getSupply } = useMembershipMintPageActions();

  const [ownsGeneralCard, setOwnsGeneralCard] = useState(false);
  const onAllowList = useMemo(() => Boolean(account) && allowList.includes(account!), [account]);

  const canMintToken = useMemo(
    () => !ownsGeneralCard && onAllowList,
    [onAllowList, ownsGeneralCard]
  );

  // use a ref to track if we called OS, to limit to only calling them once
  const finishedCallingOpensea = useRef(false);
  useEffect(() => {
    async function checkIfUserCanMint(account: string) {
      const generalCardDetectedInAccount = await detectOwnedGeneralCardsFromOpensea(account);

      if (generalCardDetectedInAccount) {
        setOwnsGeneralCard(true);
      }

      finishedCallingOpensea.current = true;
    }

    if (account && !finishedCallingOpensea.current) {
      void checkIfUserCanMint(account);
    }
  }, [account]);

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number) => {
      if (contract && account) {
        const merkleProof = generateMerkleProof(account);
        return contract.mint(account, tokenId, merkleProof);
      }
    },
    [account]
  );

  const onMintSuccess = useCallback(async () => {
    setOwnsGeneralCard(true);
  }, []);

  useEffect(() => {
    if (contract) {
      getSupply(contract, MEMBERSHIP_NFT_GENERAL.tokenId);
    }
  }, [getSupply, contract]);

  return (
    <MembershipMintPage
      membershipNft={MEMBERSHIP_NFT_GENERAL}
      canMintToken={canMintToken}
      contract={contract}
      mintToken={mintToken}
      onMintSuccess={onMintSuccess}
    />
  );
}

function PartnerMembershipMintPage() {
  return (
    <MembershipMintPageProvider>
      <PartnerMembershipMintPageContent />;
    </MembershipMintPageProvider>
  );
}

export default PartnerMembershipMintPage;

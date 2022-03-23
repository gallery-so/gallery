import { Web3Provider } from '@ethersproject/providers';
import { MembershipMintPage } from 'scenes/MembershipMintPage/MembershipMintPage';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
import { getLocalAllowlist } from './GeneralCardAllowlist';
import { baseurl, vanillaFetcher } from 'contexts/swr/useFetcher';
import useSWR from 'swr';

export type AssetContract = {
  address: string;
};

const OPENSEA_API_BASEURL = process.env.NEXT_PUBLIC_OPENSEA_API_BASEURL ?? 'https://api.opensea.io';

function generateMerkleProof(address: string, allowlist: string[]) {
  const merkleTree = new MerkleTree(allowlist);
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

function useAllowlist(): Set<string> {
  const { data, error } = useSWR(`${baseurl}/glry/v1/proxy/snapshot`, vanillaFetcher, {
    suspense: false,
  });

  // if API is down, fall back to hard-coded local data
  if (!data || error) {
    console.error('no data returned from the server. using backup.');
    return getLocalAllowlist();
  }

  return new Set(data);
}

function GeneralMembershipMintPageContent() {
  const { account: rawAccount } = useWeb3React<Web3Provider>();
  const account = rawAccount?.toLowerCase();
  const contract = useGeneralMembershipCardContract();

  const { getSupply } = useMembershipMintPageActions();

  const [ownsGeneralCard, setOwnsGeneralCard] = useState(false);

  const allowlist = useAllowlist();

  useEffect(() => {
    // for debugging
    console.log('allow list entries:', allowlist);
  }, [allowlist]);

  const onAllowList = useMemo(
    () => typeof account === 'string' && allowlist.has(account),
    [account, allowlist]
  );

  const canMintToken = useMemo(
    () => !ownsGeneralCard && onAllowList,
    [onAllowList, ownsGeneralCard]
  );

  useEffect(() => {
    async function checkIfUserCanMint(account: string) {
      const generalCardDetectedInAccount = await detectOwnedGeneralCardsFromOpensea(account);
      setOwnsGeneralCard(generalCardDetectedInAccount);
    }

    if (account) {
      void checkIfUserCanMint(account);
    }
  }, [account]);

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number) => {
      if (contract && account) {
        const merkleProof = generateMerkleProof(account, Array.from(allowlist));
        return contract.mint(account, tokenId, merkleProof);
      }
    },
    [account, allowlist]
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

function GeneralMembershipMintPage() {
  return (
    <MembershipMintPageProvider>
      <GeneralMembershipMintPageContent />
    </MembershipMintPageProvider>
  );
}

export default GeneralMembershipMintPage;

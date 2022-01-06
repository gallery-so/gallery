import { Web3Provider } from '@ethersproject/providers';
import { MembershipMintPage } from 'scenes/MembershipMintPage/MembershipMintPage';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  GENERAL_MEMBERSHIP_CONRTACT_ADDRESS,
  useGeneralMembershipCardContract,
} from 'hooks/useContract';
import Web3 from 'web3';
import MerkleTree from './MerkleTree';
import { Contract } from '@ethersproject/contracts';

import MembershipMintPageProvider, {
  useMembershipMintPageActions,
} from 'contexts/membershipMintPage/MembershipMintPageContext';
import { MEMBERSHIP_NFT_GENERAL } from './cardProperties';

const web3 = new Web3();

export type AssetContract = {
  address: string;
};

export type OpenseaAsset = {
  asset_contract: AssetContract;
};

// A list of whitelisted partner contracts. contract address + name
const partnerContracts: Record<string, string> = {
  '0xb3d5858d11ff402e3626dba53009cb46666f3c54': 'Gallery Membership Card',
};

function encodeParameters(parameters: Array<string | number>) {
  return web3.eth.abi.encodeParameters(
    ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
    parameters
  );
}

const OPENSEA_API_BASEURL = process.env.NEXT_PUBLIC_OPENSEA_API_BASEURL ?? 'https://api.opensea.io';

// reduces a list of Opensea Assets to a list just the contract addresses
export function reduceOpenseaAssetsToContractAddresses(assets: OpenseaAsset[]) {
  const partnerNftAddressesOwned = assets.reduce(
    (acc: Record<string, boolean>, asset: OpenseaAsset) => {
      if (asset.asset_contract.address) {
        acc[asset.asset_contract.address] = true;
      }

      return acc;
    },
    {}
  );
  return Object.keys(partnerNftAddressesOwned);
}

function generateMerkleProof(encodedAbi1: string, encodedAbi2: string) {
  const elements = [encodedAbi1, encodedAbi2];
  const merkleTree = new MerkleTree(elements);
  return merkleTree.getHexProof(elements[0]);
}

// Checks to see if the address owns any partner NFTs by
// retrieving all NFTs owned by a user from opensea,
// and filtering the list by whitelisted partner contract addresses
async function detectOwnedPartnerNftsFromOpensea(
  account: string,
  addresses: string[]
): Promise<string[]> {
  const params = getContractAddressQueryParams(addresses);
  const response = await fetch(
    `${OPENSEA_API_BASEURL}/api/v1/assets?owner=${account}${params}`,
    {}
  );

  const responseBody = await response.json();

  if (responseBody.assets.length > 0) {
    return reduceOpenseaAssetsToContractAddresses(responseBody.assets);
  }

  return [];
}

async function detectOwnedGeneralCardsFromOpensea(account: string) {
  const response = await fetch(
    `${OPENSEA_API_BASEURL}/api/v1/assets?owner=${account}&asset_contract_addresses=${GENERAL_MEMBERSHIP_CONRTACT_ADDRESS}`,
    {}
  );

  const responseBody = await response.json();
  return responseBody.assets.length > 0;
}

// Turns list of contract addresses into url parameters for the GET call to Opensea
function getContractAddressQueryParams(addresses: string[]) {
  return addresses.map((address) => `&asset_contract_addresses=${address}`).join('');
}

function PartnerMembershipMintPageContent() {
  const { account } = useWeb3React<Web3Provider>();
  const contract = useGeneralMembershipCardContract();

  const { getSupply } = useMembershipMintPageActions();

  const [ownedPartnerNfts, setOwnedPartnerNfts] = useState<string[]>([]);
  const [ownsGeneralCard, setOwnsGeneralCard] = useState(false);
  const canMintToken = useMemo(
    () => !ownsGeneralCard && ownedPartnerNfts.length > 0,
    [ownedPartnerNfts.length, ownsGeneralCard]
  );

  // Regardless of how many partner NFTs they own, we just need one contract address to mint with, so pick first one in list.
  const partnerContractAddress = ownedPartnerNfts[0];

  // use a ref to track if we called OS, to limit to only calling them once
  const finishedCallingOpensea = useRef(false);
  useEffect(() => {
    async function checkIfUserCanMint(account: string, addresses: string[]) {
      const generalCardDetectedInAccount = await detectOwnedGeneralCardsFromOpensea(account);

      if (generalCardDetectedInAccount) {
        finishedCallingOpensea.current = true;
        setOwnsGeneralCard(true);
        return;
      }

      const ownedPartnerNfts = await detectOwnedPartnerNftsFromOpensea(account, addresses);
      finishedCallingOpensea.current = true;
      setOwnedPartnerNfts(ownedPartnerNfts);
    }

    if (account && !finishedCallingOpensea.current) {
      void checkIfUserCanMint(account, Object.keys(partnerContracts));
    }
  }, [account]);

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number) => {
      if (contract) {
        const encodedAbi1 = encodeParameters([partnerContractAddress, 0, 0, 1, 0]);
        const encodedAbi2 = encodeParameters([partnerContractAddress, 0, 10, 1, 1]);
        const merkleProof = generateMerkleProof(encodedAbi1, encodedAbi2);
        return contract.mint(account, tokenId, 0, encodedAbi1, merkleProof);
      }
    },
    [account, partnerContractAddress]
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

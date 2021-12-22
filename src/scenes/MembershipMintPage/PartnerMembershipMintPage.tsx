import { Web3Provider } from '@ethersproject/providers';
import { MembershipMintPage } from 'scenes/MembershipMintPage/MembershipMintPage';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useGeneralMembershipCardContract } from 'hooks/useContract';
import Web3 from 'web3';
import MerkleTree from './MerkleTree';
import { Contract } from '@ethersproject/contracts';

import MembershipMintPageProvider, {
  useMembershipMintPageActions,
} from 'contexts/membershipMintPage/MembershipMintPageContext';
import { MEMBERSHIP_NFT_GENERAL } from './cardProperties';

const web3 = new Web3();

type AssetContract = {
  address: string;
};

type Asset = {
  asset_contract: AssetContract;
};

const whitelistedContracts = {
  '0xb3d5858d11ff402e3626dba53009cb46666f3c54': 'Gallery Membership Card',
};

function encodeParameters(parameters: Array<string | number>) {
  return web3.eth.abi.encodeParameters(
    ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
    parameters
  );
}

// Turns list of contract addresses into url parameters for the GET call to Opensea
function getContractAddressParameters() {
  return Object.keys(whitelistedContracts)
    .map((address) => `&asset_contract_addresses=${address}`)
    .join('');
}

function PartnerMembershipMintPageContent() {
  const { account } = useWeb3React<Web3Provider>();
  const contract = useGeneralMembershipCardContract();

  const [ownedPartnerTokens, setOwnedPartnerTokens] = useState<string[]>([]);

  const ownsPartnerTokens = useMemo(() => ownedPartnerTokens.length > 0, [ownedPartnerTokens]);

  const canMintToken = useMemo(() => ownsPartnerTokens, [ownsPartnerTokens]);

  const { getSupply } = useMembershipMintPageActions();

  // determine logic for choosing an address. first one?
  const partnerContractAddress = useMemo(() => ownedPartnerTokens[0], [ownedPartnerTokens]);

  const encodedAbi1 = useMemo(
    () => encodeParameters([partnerContractAddress, 0, 0, 1, 0]),
    [partnerContractAddress]
  );

  const encodedAbi2 = useMemo(
    () => encodeParameters([partnerContractAddress, 0, 10, 1, 1]),
    [partnerContractAddress]
  );

  // use a ref to track if we called OS, to limit to only calling them once
  const calledOpenseaRef = useRef(false);
  useEffect(() => {
    if (account && !calledOpenseaRef.current) {
      console.log(getContractAddressParameters());
      // const response = await fetch(
      //   `https://api.opensea.io/api/v1/assets?owner=${account}&asset_contract_addresses=${partnerContractAddress}`,
      //   {}
      // );
      calledOpenseaRef.current = true;

      // const responseBody = await response.json();
      const responseBody = { assets: [] };
      if (responseBody.assets.length > 0) {
        // TODO turn into function and test
        const ownedContracts = responseBody.assets.reduce(
          (acc: Record<string, boolean>, asset: Asset) => {
            if (asset.asset_contract.address) {
              acc[asset.asset_contract.address] = true;
            }

            return acc;
          },
          {}
        );
        setOwnedPartnerTokens(Object.keys(ownedContracts));
        // return Object.keys(ownedContracts);
      }

      // console.log(response);
    }
  }, [account]);

  const merkleProof = useMemo(() => {
    // todo: turn into function that returns the merkle proof
    const elements = [encodedAbi1, encodedAbi2];
    console.log(new MerkleTree(elements));
    const merkleTree = new MerkleTree(elements);
    return merkleTree.getHexProof(elements[0]);
  }, [encodedAbi1, encodedAbi2]);

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number) => {
      console.log('contract', contract);
      if (contract) {
        console.log('aaah im mintinngg');
        await contract.mint(account, tokenId, 0, encodedAbi1, merkleProof);
      }
    },
    [account, encodedAbi1, merkleProof]
  );

  useEffect(() => {
    if (contract) {
      getSupply(contract, 0);
    }
  }, [getSupply, contract, merkleProof]);

  return (
    <MembershipMintPage
      membershipNft={MEMBERSHIP_NFT_GENERAL}
      canMintToken={canMintToken}
      contract={contract}
      mintToken={mintToken}
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

import { Web3Provider } from '@ethersproject/providers';
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
import { graphql, useFragment } from 'react-relay';
import { GeneralMembershipMintPageUseAllowlistFragment$key } from '__generated__/GeneralMembershipMintPageUseAllowlistFragment.graphql';
import { GeneralMembershipMintPageContentFragment$key } from '__generated__/GeneralMembershipMintPageContentFragment.graphql';
import { GeneralMembershipMintPageFragment$key } from '__generated__/GeneralMembershipMintPageFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { OPENSEA_API_BASEURL } from 'constants/opensea';
import { CustomizedGeneralMembershipMintPage } from './CustomizedGeneralMembershipMintPage';

export type AssetContract = {
  address: string;
};

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

function useAllowlist(queryRef: GeneralMembershipMintPageUseAllowlistFragment$key): Set<string> {
  const query = useFragment(
    graphql`
      fragment GeneralMembershipMintPageUseAllowlistFragment on Query {
        generalAllowlist @required(action: THROW) {
          address
        }
      }
    `,
    queryRef
  );

  const data = query.generalAllowlist;

  // if API is down, fall back to hard-coded local data
  if (!data) {
    console.error('no data returned from the server. using backup.');
    return getLocalAllowlist();
  }

  return new Set(removeNullValues(data.map((entry) => entry.address)));
}

type ContentProps = {
  queryRef: GeneralMembershipMintPageContentFragment$key;
};

function GeneralMembershipMintPageContent({ queryRef }: ContentProps) {
  const query = useFragment(
    graphql`
      fragment GeneralMembershipMintPageContentFragment on Query {
        ...GeneralMembershipMintPageUseAllowlistFragment
      }
    `,
    queryRef
  );

  const { account: rawAccount } = useWeb3React<Web3Provider>();
  const account = rawAccount?.toLowerCase();
  const contract = useGeneralMembershipCardContract();

  const { getSupply } = useMembershipMintPageActions();

  const [ownsGeneralCard, setOwnsGeneralCard] = useState(false);

  const allowlist = useAllowlist(query);

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
    <CustomizedGeneralMembershipMintPage
      membershipNft={MEMBERSHIP_NFT_GENERAL}
      canMintToken={canMintToken}
      contract={contract}
      mintToken={mintToken}
      onMintSuccess={onMintSuccess}
    />
  );
}

type Props = {
  queryRef: GeneralMembershipMintPageFragment$key;
};

function GeneralMembershipMintPage({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GeneralMembershipMintPageFragment on Query {
        ...GeneralMembershipMintPageContentFragment
      }
    `,
    queryRef
  );

  return (
    <MembershipMintPageProvider>
      <GeneralMembershipMintPageContent queryRef={query} />
    </MembershipMintPageProvider>
  );
}

export default GeneralMembershipMintPage;

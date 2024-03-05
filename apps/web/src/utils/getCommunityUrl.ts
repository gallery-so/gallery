import { Route } from 'nextjs-routes';
import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { getCommunityUrlFromCommunityFragment$key } from '~/generated/getCommunityUrlFromCommunityFragment.graphql';
import { LowercaseChain } from '~/shared/utils/chains';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';

export function getCommunityUrlFromCommunity(
  communityRef: getCommunityUrlFromCommunityFragment$key
): Route {
  const community = readInlineData(
    graphql`
      fragment getCommunityUrlFromCommunityFragment on Community @inline {
        ...extractRelevantMetadataFromCommunityFragment
      }
    `,
    communityRef
  );

  const { chain, contractAddress, subtype, projectId } =
    extractRelevantMetadataFromCommunity(community);

  if (subtype === 'ArtBlocksCommunity') {
    if (chain === 'Ethereum') {
      return {
        pathname: `/community/artblocks/[contractAddress]/[projectId]`,
        query: { contractAddress, projectId },
      };
    }
    if (chain === 'Arbitrum') {
      return {
        pathname: `/community/prohibition/[contractAddress]/[projectId]`,
        query: { contractAddress, projectId },
      };
    }
  }
  return {
    pathname: `/community/[chain]/[contractAddress]`,
    query: { contractAddress, chain },
  };
}

// raw URL getter if we don't have the community available, but do have address and chain.
// this is typically used for badges.
export function getUrlForCommunityDangerously(
  contractAddress: string,
  chain: LowercaseChain
): Route | null {
  return {
    pathname: `/community/[chain]/[contractAddress]`,
    query: { contractAddress, chain },
  };
}

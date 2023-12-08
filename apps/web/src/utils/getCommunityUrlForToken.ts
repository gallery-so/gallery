import { Route } from 'nextjs-routes';
import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { getCommunityUrlForTokenFragment$key } from '~/generated/getCommunityUrlForTokenFragment.graphql';
import { LowercaseChain } from '~/shared/utils/chains';

export function getUrlForCommunity(contractAddress: string, chain: LowercaseChain): Route | null {
  return {
    pathname: `/community/[chain]/[contractAddress]`,
    query: { contractAddress, chain },
  };
}

export function getCommunityUrlForToken(
  tokenRef: getCommunityUrlForTokenFragment$key
): Route | null {
  const token = readInlineData(
    graphql`
      fragment getCommunityUrlForTokenFragment on Token @inline {
        contract {
          chain
          contractAddress {
            address
          }
        }
      }
    `,
    tokenRef
  );

  const contractAddress = token.contract?.contractAddress?.address;
  const chain = token.contract?.chain || null;
  const lowercaseChain = chain?.toLowerCase();
  if (!contractAddress) {
    return null;
  }

  return getUrlForCommunity(contractAddress, lowercaseChain as LowercaseChain);
}

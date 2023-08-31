import { Route } from 'nextjs-routes';
import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { getCommunityUrlForTokenFragment$key } from '~/generated/getCommunityUrlForTokenFragment.graphql';
import { LowercaseChain } from '~/shared/utils/chains';

// not used anywhere but keeping around for posterity / potential future usage
export const KNOWN_OMNIBUS_CONTRACTS = [
  '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270', // Art Blocks
  '0x059edd72cd353df5106d2b9cc5ab83a52287ac3a', // Art Blocks
  '0x99a9b7c1116f9ceeb1652de04d5969cce509b069', // Art Blocks
  '0x495f947276749ce646f68ac8c248420045cb7b5e', // OS
  '0xf6793da657495ffeff9ee6350824910abc21356c', // Rarible
  '0x3b3ee1931dc30c1957379fac9aba94d1c48a5405', // Foundation
  '0xdfde78d2baec499fe18f2be74b6c287eed9511d7', // Braindrops
];

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

import { readInlineData } from 'relay-runtime';
import { graphql } from 'react-relay';
import { getCommunityUrlForTokenFragment$key } from '../../__generated__/getCommunityUrlForTokenFragment.graphql';
import { Route } from 'nextjs-routes';

export const DISABLED_CONTRACTS = [
  '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270', // Art Blocks
  '0x495f947276749ce646f68ac8c248420045cb7b5e', // OS
  '0xf6793da657495ffeff9ee6350824910abc21356c', // Rarible
  '0x3b3ee1931dc30c1957379fac9aba94d1c48a5405', // Foundation
  '0xdfde78d2baec499fe18f2be74b6c287eed9511d7', // Braindrops
];

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

  if (!contractAddress) {
    return null;
  }

  if (DISABLED_CONTRACTS.includes(contractAddress)) {
    return null;
  }

  if (token.contract.chain === 'POAP') {
    return { pathname: '/community/poap/[contractAddress]', query: { contractAddress } };
  } else if (token.contract.chain === 'Tezos') {
    return { pathname: '/community/tez/[contractAddress]', query: { contractAddress } };
  } else {
    return { pathname: '/community/[contractAddress]', query: { contractAddress } };
  }
}

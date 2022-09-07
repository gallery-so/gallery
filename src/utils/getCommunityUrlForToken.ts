import { readInlineData } from 'relay-runtime';
import { graphql } from 'react-relay';
import { getCommunityUrlForTokenFragment$key } from '../../__generated__/getCommunityUrlForTokenFragment.graphql';
import { DISABLED_CONTRACTS } from '../../pages/community/[contractAddress]';

export function getCommunityUrlForToken(
  tokenRef: getCommunityUrlForTokenFragment$key
): string | null {
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

  if (!token.contract?.contractAddress?.address) {
    return null;
  }

  if (DISABLED_CONTRACTS.includes(token.contract.contractAddress.address)) {
    return null;
  }

  return token.contract.chain === 'POAP'
    ? `/community/poap/${token.contract.contractAddress.address}`
    : `/community/${token.contract.contractAddress.address}`;
}

/* eslint-disable relay/no-future-added-value */
import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { doesUserOwnWalletFromChainFamilyFragment$key } from '~/generated/doesUserOwnWalletFromChainFamilyFragment.graphql';

import { Chain, chainsMap } from './chains';

export function doesUserOwnWalletFromChainFamily(
  _chain: Chain,
  queryRef: doesUserOwnWalletFromChainFamilyFragment$key
) {
  const query = readInlineData(
    graphql`
      fragment doesUserOwnWalletFromChainFamilyFragment on Query @inline {
        viewer {
          ... on Viewer {
            user {
              wallets {
                chain
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  return query.viewer?.user?.wallets?.some((wallet) => {
    if (_chain === 'All Networks') {
      return true;
    }
    if (!wallet?.chain) {
      return false;
    }
    return chainsMap[wallet.chain as Chain].baseChain === chainsMap[_chain].baseChain;
  });
}

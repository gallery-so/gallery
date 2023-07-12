/* eslint-disable relay/no-future-added-value */
import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { chainsMap } from '~/components/GalleryEditor/PiecesSidebar/chains';
import {
  Chain,
  doesUserOwnWalletFromChainFamilyFragment$key,
} from '~/generated/doesUserOwnWalletFromChainFamilyFragment.graphql';

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
    if (_chain === '%future added value') {
      return false;
    }
    if (!wallet?.chain) {
      return false;
    }
    if (wallet.chain === '%future added value') {
      return false;
    }
    return chainsMap[wallet.chain].baseChain === chainsMap[_chain].baseChain;
  });
}

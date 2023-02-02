import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import {
  Chain,
  doesUserOwnWalletFromChainFragment$key,
} from '~/generated/doesUserOwnWalletFromChainFragment.graphql';

export function doesUserOwnWalletFromChain(
  _chain: Chain,
  queryRef: doesUserOwnWalletFromChainFragment$key
) {
  const chain: Chain = _chain === 'POAP' ? 'Ethereum' : _chain;

  const query = readInlineData(
    graphql`
      fragment doesUserOwnWalletFromChainFragment on Query @inline {
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

  return query.viewer?.user?.wallets?.some((wallet) => wallet?.chain === chain);
}

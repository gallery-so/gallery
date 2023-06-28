import { graphql, readInlineData } from 'react-relay';

import { groupNftSelectorCollectionsByAddressTokenFragment$data } from '~/generated/groupNftSelectorCollectionsByAddressTokenFragment.graphql';
import { NftSelectorViewFragment$data } from '~/generated/NftSelectorViewFragment.graphql';

export type NftSelectorCollectionGroup = {
  title: string;
  address: string;
  tokens: Array<groupNftSelectorCollectionsByAddressTokenFragment$data>;
};

type groupCollectionsByAddressArgs = {
  ignoreSpam?: boolean;
  tokensRef: NftSelectorViewFragment$data;
};

export function groupNftSelectorCollectionsByAddress({
  ignoreSpam = false,
  tokensRef,
}: groupCollectionsByAddressArgs): NftSelectorCollectionGroup[] {
  const tokens = tokensRef.map(
    (tokenRef) =>
      readInlineData(
        graphql`
          fragment groupNftSelectorCollectionsByAddressTokenFragment on Token @inline {
            chain
            isSpamByProvider
            isSpamByUser
            contract {
              chain
              name
              contractAddress {
                address
              }
            }
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...NftSelectorTokenFragment
          }
        `,
        tokenRef
      ) as groupNftSelectorCollectionsByAddressTokenFragment$data
  );

  const map: Record<string, NftSelectorCollectionGroup> = {};
  for (const token of tokens) {
    if (ignoreSpam) {
      if (token.isSpamByProvider || token.isSpamByUser) {
        continue;
      }
    }

    if (token.contract?.contractAddress?.address) {
      const title = token.chain === 'POAP' ? 'POAP' : token.contract.name || '<untitled>';
      const address = token.chain === 'POAP' ? 'POAP' : token.contract.contractAddress.address;

      const group = map[address] ?? {
        title,
        tokens: [],
        address: token.contract.contractAddress.address,
      };

      map[address] = group;

      group.tokens.push(token);
    }
  }

  return Object.values(map);
}

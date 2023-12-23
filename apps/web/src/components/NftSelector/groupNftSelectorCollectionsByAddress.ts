import { graphql, readInlineData } from 'react-relay';

import {
  groupNftSelectorCollectionsByAddressTokenFragment$data,
  groupNftSelectorCollectionsByAddressTokenFragment$key,
} from '~/generated/groupNftSelectorCollectionsByAddressTokenFragment.graphql';
import { NftSelectorViewFragment$data } from '~/generated/NftSelectorViewFragment.graphql';

export type NftSelectorCollectionGroup = {
  title: string;
  address: string;
  dbid: string;
  tokens: Array<groupNftSelectorCollectionsByAddressTokenFragment$data>;
};

type groupCollectionsByAddressArgs = {
  ignoreSpam?: boolean;
  tokenRefs: NftSelectorViewFragment$data;
};

export function groupNftSelectorCollectionsByAddress({
  ignoreSpam = false,
  tokenRefs,
}: groupCollectionsByAddressArgs): NftSelectorCollectionGroup[] {
  const tokens = tokenRefs.map((tokenRef) =>
    readInlineData<groupNftSelectorCollectionsByAddressTokenFragment$key>(
      graphql`
        fragment groupNftSelectorCollectionsByAddressTokenFragment on Token @inline {
          # dbid is used by NftSelectorTokenPreview.tsx
          # eslint-disable-next-line relay/unused-fields
          dbid
          # tokenId is used by NftSelectorTokenPreview.tsx
          # eslint-disable-next-line relay/unused-fields
          definition {
            tokenId
            name
            chain
            contract {
              dbid
              contractAddress {
                address
              }
              isSpam
            }
            community {
              name
            }
          }
          isSpamByUser

          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...NftSelectorTokenFragment
        }
      `,
      tokenRef
    )
  );

  const map: Record<string, NftSelectorCollectionGroup> = {};
  for (const token of tokens) {
    if (ignoreSpam) {
      if (token.definition.contract?.isSpam || token.isSpamByUser) {
        continue;
      }
    }

    if (token.definition?.contract?.contractAddress?.address) {
      const title =
        token.definition.chain === 'POAP'
          ? 'POAP'
          : token.definition.community?.name || '<untitled>';
      const address =
        token.definition.chain === 'POAP'
          ? 'POAP'
          : token.definition.contract?.contractAddress.address;

      const group = map[address] ?? {
        title,
        tokens: [],
        address: token.definition.contract.contractAddress.address,
        dbid: token.definition.contract.dbid,
      };

      map[address] = group;

      group.tokens.push(token);
    }
  }

  return Object.values(map);
}

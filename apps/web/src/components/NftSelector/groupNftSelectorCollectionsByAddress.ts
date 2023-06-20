import { NftSelectorViewFragment$data } from '~/generated/NftSelectorViewFragment.graphql';

export type NftSelectorCollectionGroup = {
  title: string;
  address: string;
  //      Remove the readonly
  tokens: Array<NftSelectorViewFragment$data[number]>;
};

type groupCollectionsByAddressArgs = {
  //      Remove the readonly
  tokens: NftSelectorViewFragment$data;
  ignoreSpam?: boolean;
};

export function groupNftSelectorCollectionsByAddress({
  tokens,
  ignoreSpam = false,
}: groupCollectionsByAddressArgs): NftSelectorCollectionGroup[] {
  const map: Record<string, NftSelectorCollectionGroup> = {};
  for (const token of tokens) {
    if (ignoreSpam) {
      if (token.isSpamByProvider || token.isSpamByUser) {
        continue;
      }
    }

    if (token.contract?.contractAddress?.address) {
      // Since POAP tokens don't have unique contracts, we give them
      // all a title of "POAP" and an address of "POAP"
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

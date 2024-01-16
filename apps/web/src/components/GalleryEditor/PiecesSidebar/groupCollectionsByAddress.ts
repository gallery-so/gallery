import { SidebarTokensFragment$data } from '~/generated/SidebarTokensFragment.graphql';

export type CollectionGroup = {
  title: string;
  address: string;
  contractId: string;
  //      Remove the readonly
  tokens: Array<SidebarTokensFragment$data[number]>;
};

type groupCollectionsByAddressArgs = {
  //      Remove the readonly
  tokens: SidebarTokensFragment$data;
  ignoreSpam?: boolean;
};

export function groupCollectionsByAddress({
  tokens,
  ignoreSpam = false,
}: groupCollectionsByAddressArgs): CollectionGroup[] {
  const map: Record<string, CollectionGroup> = {};

  for (const token of tokens) {
    if (ignoreSpam) {
      if (token.definition.contract?.isSpam || token.isSpamByUser) {
        continue;
      }
    }

    if (token.definition.contract?.contractAddress?.address) {
      // Since POAP tokens don't have unique contracts, we give them
      // all a title of "POAP" and an address of "POAP"
      const title =
        token.definition.chain === 'POAP' ? 'POAP' : token.definition.contract.name || '<untitled>';
      const address =
        token.definition.chain === 'POAP'
          ? 'POAP'
          : token.definition.contract.contractAddress.address;

      const group = map[address] ?? {
        title,
        tokens: [],
        address: token.definition.contract.contractAddress.address,
        contractId: token.definition.contract.dbid,
      };

      map[address] = group;

      group.tokens.push(token);
    }
  }

  return Object.values(map);
}

import { SidebarTokensFragment$data } from '../../../../../../__generated__/SidebarTokensFragment.graphql';
import { EditModeToken } from 'flows/shared/steps/OrganizeCollection/types';
import keyBy from 'lodash.keyby';

export type CollectionGroup = {
  title: string;
  address: string;
  tokens: Array<{
    token: SidebarTokensFragment$data[number];
    editModeToken: EditModeToken;
  }>;
};

type groupCollectionsByAddressArgs = {
  tokens: SidebarTokensFragment$data;
  editModeTokens: EditModeToken[];
};

export function groupCollectionsByAddress({
  tokens,
  editModeTokens,
}: groupCollectionsByAddressArgs): CollectionGroup[] {
  const map: Record<string, CollectionGroup> = {};
  const tokensKeyedById = keyBy(tokens, (token) => token.dbid);

  for (const editModeToken of editModeTokens) {
    const token = tokensKeyedById[editModeToken.id];

    if (!token?.contract?.contractAddress?.address || !token?.contract?.name) {
      continue;
    }

    if (token.contract.contractAddress.address && token.contract.name) {
      // Since POAP tokens don't have unique contracts, we give them
      // all a title of "POAP" and an address of "POAP"
      const title = token.chain === 'POAP' ? 'POAP' : token.contract.name;
      const address = token.chain === 'POAP' ? 'POAP' : token.contract.contractAddress.address;

      const group = map[address] ?? {
        title,
        tokens: [],
        address: token.contract.contractAddress.address,
      };

      map[address] = group;

      group.tokens.push({
        token,
        editModeToken,
      });
    }
  }

  return Object.values(map);
}

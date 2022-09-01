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
      const group = map[token.contract.contractAddress.address] ?? {
        title: token.contract.name,
        address: token.contract.contractAddress.address,
        tokens: [],
      };

      map[token.contract.contractAddress.address] = group;

      group.tokens.push({
        token,
        editModeToken,
      });
    }
  }

  return Object.values(map);
}

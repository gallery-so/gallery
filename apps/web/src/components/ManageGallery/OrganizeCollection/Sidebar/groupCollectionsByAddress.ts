import keyBy from 'lodash.keyby';

import { EditModeToken } from '~/components/ManageGallery/OrganizeCollection/types';
import { SidebarTokensFragment$data } from '~/generated/SidebarTokensFragment.graphql';

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

    // @ts-expect-error This file will be deleted soon
    if (token.contract?.contractAddress?.address) {
      // Since POAP tokens don't have unique contracts, we give them
      // all a title of "POAP" and an address of "POAP"
      // @ts-expect-error This file will be deleted soon
      const title = token.chain === 'POAP' ? 'POAP' : token.contract.name || '<untitled>';
      // @ts-expect-error This file will be deleted soon
      const address = token.chain === 'POAP' ? 'POAP' : token.contract.contractAddress.address;

      const group = map[address] ?? {
        title,
        tokens: [],
        // @ts-expect-error This file will be deleted soon
        address: token.contract.contractAddress.address,
      };

      map[address] = group;

      group.tokens.push({
        // @ts-expect-error This file will be deleted soon
        token,
        editModeToken,
      });
    }
  }

  return Object.values(map);
}

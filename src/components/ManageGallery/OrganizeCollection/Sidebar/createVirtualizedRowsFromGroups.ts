import keyBy from 'lodash.keyby';

import { CollectionGroup } from '~/components/ManageGallery/OrganizeCollection/Sidebar/groupCollectionsByAddress';
import {
  TokenAndEditModeToken,
  VirtualizedRow,
} from '~/components/ManageGallery/OrganizeCollection/Sidebar/SidebarList';
import { EditModeToken } from '~/components/ManageGallery/OrganizeCollection/types';
import { SidebarTokensFragment$data } from '~/generated/SidebarTokensFragment.graphql';

type createVirtualizedRowsFromGroupsArgs = {
  groups: CollectionGroup[];
  collapsedCollections: Set<string>;
};

export function createVirtualizedRowsFromGroups({
  groups,
  collapsedCollections,
}: createVirtualizedRowsFromGroupsArgs): VirtualizedRow[] {
  const rows: VirtualizedRow[] = [];

  for (const group of groups) {
    // Default to expanded
    const expanded = !collapsedCollections.has(group.address);

    rows.push({ type: 'collection-title', expanded, address: group.address, title: group.title });

    const COLUMNS_PER_ROW = 3;
    for (let i = 0; i < group.tokens.length; i += COLUMNS_PER_ROW) {
      const rowTokens = group.tokens.slice(i, i + COLUMNS_PER_ROW);

      rows.push({ type: 'tokens', tokens: rowTokens, expanded });
    }
  }

  return rows;
}

type createVirtualizedRowsFromTokensArgs = {
  tokens: SidebarTokensFragment$data;
  editModeTokens: EditModeToken[];
};

export function createVirtualizedRowsFromTokens({
  tokens,
  editModeTokens,
}: createVirtualizedRowsFromTokensArgs): VirtualizedRow[] {
  const rows: VirtualizedRow[] = [];
  const tokensKeyedById = keyBy(tokens, (token) => token.dbid);

  const tokensSortedByErrored: TokenAndEditModeToken[] = editModeTokens.map((editModeToken) => {
    return {
      editModeToken,
      token: tokensKeyedById[editModeToken.id],
    };
  });

  const COLUMNS_PER_ROW = 3;
  for (let i = 0; i < tokensSortedByErrored.length; i += COLUMNS_PER_ROW) {
    const rowTokens = tokensSortedByErrored.slice(i, i + COLUMNS_PER_ROW);

    rows.push({
      type: 'tokens',
      tokens: rowTokens,
      expanded: true,
    });
  }

  return rows;
}

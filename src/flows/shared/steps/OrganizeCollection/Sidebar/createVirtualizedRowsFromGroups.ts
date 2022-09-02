import { CollectionGroup } from 'flows/shared/steps/OrganizeCollection/Sidebar/groupCollectionsByAddress';
import {
  TokenAndEditModeToken,
  VirtualizedRow,
} from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarList';
import { SidebarTokensFragment$data } from '../../../../../../__generated__/SidebarTokensFragment.graphql';
import { EditModeToken } from 'flows/shared/steps/OrganizeCollection/types';
import keyBy from 'lodash.keyby';

type createVirtualizedRowsFromGroupsArgs = {
  groups: CollectionGroup[];
  erroredTokenIds: Set<string>;
  collapsedCollections: Set<string>;
};

export function createVirtualizedRowsFromGroups({
  groups,
  erroredTokenIds,
  collapsedCollections,
}: createVirtualizedRowsFromGroupsArgs): VirtualizedRow[] {
  const rows: VirtualizedRow[] = [];

  for (const group of groups) {
    const tokensSortedByErrored: TokenAndEditModeToken[] = [...group.tokens].sort((a, b) => {
      const aIsErrored = erroredTokenIds.has(a.token.dbid);
      const bIsErrored = erroredTokenIds.has(b.token.dbid);

      if (aIsErrored === bIsErrored) {
        return 0;
      } else if (aIsErrored) {
        return 1;
      } else {
        return -1;
      }
    });

    // Default to expanded
    const expanded = !collapsedCollections.has(group.address);

    rows.push({ type: 'collection-title', expanded, address: group.address, title: group.title });

    const COLUMNS_PER_ROW = 3;
    for (let i = 0; i < tokensSortedByErrored.length; i += COLUMNS_PER_ROW) {
      const rowTokens = tokensSortedByErrored.slice(i, i + COLUMNS_PER_ROW);

      rows.push({ type: 'tokens', tokens: rowTokens, expanded });
    }
  }

  return rows;
}

type createVirtualizedRowsFromTokensArgs = {
  tokens: SidebarTokensFragment$data;
  editModeTokens: EditModeToken[];
  erroredTokenIds: Set<string>;
};

export function createVirtualizedRowsFromTokens({
  tokens,
  editModeTokens,
  erroredTokenIds,
}: createVirtualizedRowsFromTokensArgs): VirtualizedRow[] {
  const rows: VirtualizedRow[] = [];
  const tokensKeyedById = keyBy(tokens, (token) => token.dbid);

  const editModeTokensSortedByErrored = [...editModeTokens].sort((a, b) => {
    const aIsErrored = erroredTokenIds.has(a.id);
    const bIsErrored = erroredTokenIds.has(b.id);

    if (aIsErrored === bIsErrored) {
      return 0;
    } else if (aIsErrored) {
      return 1;
    } else {
      return -1;
    }
  });

  const tokensSortedByErrored: TokenAndEditModeToken[] = editModeTokensSortedByErrored.map(
    (editModeToken) => {
      return {
        editModeToken,
        token: tokensKeyedById[editModeToken.id],
      };
    }
  );

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

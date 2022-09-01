import { CollectionGroup } from 'flows/shared/steps/OrganizeCollection/Sidebar/groupCollectionsByAddress';
import { SidebarTokensFragment$data } from '../../../../../../__generated__/SidebarTokensFragment.graphql';
import { EditModeToken } from 'flows/shared/steps/OrganizeCollection/types';

export type TokenOrWhitespace =
  | { token: SidebarTokensFragment$data[number]; editModeToken: EditModeToken }
  | 'whitespace';

export type VirtualizedRow =
  | { type: 'collection-title'; expanded: boolean; address: string; title: string }
  | { type: 'tokens'; tokens: TokenOrWhitespace[]; expanded: boolean };

type createVirtualizedRowsArgs = {
  groups: CollectionGroup[];
  erroredTokenIds: Set<string>;
  collapsedCollections: Set<string>;
};

export function createVirtualizedRows({
  groups,
  erroredTokenIds,
  collapsedCollections,
}: createVirtualizedRowsArgs): VirtualizedRow[] {
  const rows: VirtualizedRow[] = [];

  for (const group of groups) {
    const tokensSortedByErrored = [...group.tokens].sort((a, b) => {
      const aIsErrored = erroredTokenIds.has(a.token.dbid);
      const bIsErrored = erroredTokenIds.has(b.token.dbid);

      if (aIsErrored === bIsErrored) {
        return 0;
      } else if (aIsErrored) {
        return -1;
      } else {
        return 1;
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

import keyBy from 'lodash.keyby';

import { CollectionGroup } from '~/components/GalleryEditor/PiecesSidebar/groupCollectionsByAddress';
import { VirtualizedRow } from '~/components/GalleryEditor/PiecesSidebar/SidebarList';
import { SidebarListTokenNewFragment$key } from '~/generated/SidebarListTokenNewFragment.graphql';
import { SidebarTokensNewFragment$data } from '~/generated/SidebarTokensNewFragment.graphql';

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
    const tokensSortedByErrored: SidebarListTokenNewFragment$key[] = [...group.tokens].sort(
      (a, b) => {
        const aIsErrored = erroredTokenIds.has(a.dbid);
        const bIsErrored = erroredTokenIds.has(b.dbid);

        if (aIsErrored === bIsErrored) {
          return 0;
        } else if (aIsErrored) {
          return 1;
        } else {
          return -1;
        }
      }
    );

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
  tokens: SidebarTokensNewFragment$data;
  erroredTokenIds: Set<string>;
};

export function createVirtualizedRowsFromTokens({
  tokens,
  erroredTokenIds,
}: createVirtualizedRowsFromTokensArgs): VirtualizedRow[] {
  const rows: VirtualizedRow[] = [];

  const tokensSortedByErrored = [...tokens].sort((a, b) => {
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

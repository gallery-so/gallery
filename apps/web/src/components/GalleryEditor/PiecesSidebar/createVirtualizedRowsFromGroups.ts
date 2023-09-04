import { CollectionGroup } from '~/components/GalleryEditor/PiecesSidebar/groupCollectionsByAddress';
import { VirtualizedRow } from '~/components/GalleryEditor/PiecesSidebar/SidebarList/SidebarList';
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
    const { title, address, tokens } = group;

    // Default to expanded
    const expanded = !collapsedCollections.has(address);

    rows.push({
      type: 'collection-title',
      expanded,
      address: address,
      title: title,
      count: tokens.length,
    });

    const COLUMNS_PER_ROW = 3;
    for (let i = 0; i < tokens.length; i += COLUMNS_PER_ROW) {
      const rowTokens = tokens.slice(i, i + COLUMNS_PER_ROW);

      rows.push({
        type: 'tokens',
        tokens: rowTokens,
        expanded,
      });
    }
  }

  return rows;
}

type createVirtualizedRowsFromTokensArgs = {
  tokens: SidebarTokensFragment$data;
<<<<<<< HEAD
};

export function createVirtualizedRowsFromTokens({
  tokens = [],
}: createVirtualizedRowsFromTokensArgs): VirtualizedRow[] {
  const rows: VirtualizedRow[] = [];

=======
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

>>>>>>> 3cc99ed1 (base)
  const COLUMNS_PER_ROW = 3;
  for (let i = 0; i < tokens.length; i += COLUMNS_PER_ROW) {
    const rowTokens = tokens.slice(i, i + COLUMNS_PER_ROW);

    rows.push({
      type: 'tokens',
      tokens: rowTokens,
      expanded: true,
    });
  }

  return rows;
}

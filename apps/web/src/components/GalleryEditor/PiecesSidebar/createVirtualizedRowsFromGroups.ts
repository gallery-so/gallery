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
  filteredTokensBySelectedWallet: SidebarTokensFragment$data;
};

export function createVirtualizedRowsFromTokens({
  filteredTokensBySelectedWallet,
}: createVirtualizedRowsFromTokensArgs): VirtualizedRow[] {
  const rows: VirtualizedRow[] = [];

  const tokens = filteredTokensBySelectedWallet ?? [];

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

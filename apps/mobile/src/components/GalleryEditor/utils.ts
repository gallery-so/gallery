import { StagedRow, StagedRowList, StagedSectionList } from '~/contexts/GalleryEditor/types';

import { ItemHeights, Positions } from './SortableRowList';

type Offset = {
  y: number;
  height: number;
};

const horizontalRowPadding = 16;
const inBetweenColumnPadding = 0;

export function getRowHeight(row: StagedRow, screenDimensionsWidth: number) {
  const column = row.columns;
  const totalSpaceForTokens =
    screenDimensionsWidth - horizontalRowPadding * 2 - inBetweenColumnPadding * (column - 1);

  const heightPerToken = totalSpaceForTokens / column;

  const linePerRow = Math.round(row.items.length / column);

  return heightPerToken * linePerRow;
}

export function calculatePositions(rows: StagedRowList, screenDimensionsWidth: number): Positions {
  let cumulativeHeight = 0;

  const positions: Positions = {};
  rows.forEach((row, index) => {
    const height = getRowHeight(row, screenDimensionsWidth);

    positions[index] = cumulativeHeight;
    cumulativeHeight += height;
  });

  return positions;
}

export function calculateItemHeights(
  rows: StagedRowList,
  screenDimensionsWidth: number
): ItemHeights {
  const itemHeights: ItemHeights = {};
  rows.forEach((row, index) => {
    itemHeights[index] = getRowHeight(row, screenDimensionsWidth);
  });

  return itemHeights;
}

export function calculateOffsetsRow(sections: StagedSectionList, screenDimensionsWidth: number) {
  const rowOffsets: Offset[] = [];

  sections.forEach((section) => {
    let cumulativeHeight = 0;

    section.rows.forEach((row) => {
      const height = getRowHeight(row, screenDimensionsWidth);

      const offset = {
        ...row,
        y: cumulativeHeight,
        height,
      };

      cumulativeHeight += height;

      rowOffsets.push(offset);
    });
  });

  return rowOffsets;
}

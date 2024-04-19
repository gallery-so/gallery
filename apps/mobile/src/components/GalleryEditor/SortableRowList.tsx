import { useEffect, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { graphql, useFragment } from 'react-relay';

import { StagedRowList } from '~/contexts/GalleryEditor/types';
import { SortableRowListFragment$key } from '~/generated/SortableRowListFragment.graphql';

import { GalleryEditorRow } from './GalleryEditorRow';
import { SortableRow } from './SortableRow';
import { calculateItemHeights, calculateOffsetsRow, calculatePositions } from './utils';

type Props = {
  sectionId: string;
  rows: StagedRowList;

  queryRef: SortableRowListFragment$key;

  onDragEnd: (data: string[]) => void;
};

type Index = number;
type PositionValue = number;
type HeightValue = number;

export type Positions = Record<Index, PositionValue>;
export type ItemHeights = Record<Index, HeightValue>;

export function SortableRowList({ rows, sectionId, queryRef, onDragEnd }: Props) {
  const query = useFragment(
    graphql`
      fragment SortableRowListFragment on Query {
        ...GalleryEditorRowFragment
      }
    `,
    queryRef
  );
  const screenDimensions = useWindowDimensions();

  const rowOffsets = calculateOffsetsRow(rows, screenDimensions.width);

  const initialPositions = calculatePositions(rows, screenDimensions.width);
  const positions = useSharedValue<Positions>(initialPositions);

  const initialItemHeights = calculateItemHeights(rows, screenDimensions.width);
  const itemHeights = useSharedValue<ItemHeights>(initialItemHeights);

  const animatedIndex = useSharedValue<number | null>(null);

  // Update positions and item heights whenever rows or screen dimensions change
  useEffect(() => {
    const newPositions = calculatePositions(rows, screenDimensions.width);
    positions.value = newPositions;

    const newItemHeights = calculateItemHeights(rows, screenDimensions.width);
    itemHeights.value = newItemHeights;
  }, [itemHeights, positions, rows, screenDimensions.width]);

  const containerHeight = useMemo(() => {
    return rowOffsets.reduce((totalHeight, row) => totalHeight + row.height, 0);
  }, [rowOffsets]);

  return (
    <View
      className="relative"
      style={[
        {
          height: containerHeight,
          top: 0,
          left: 0,
          right: 0,
        },
      ]}
    >
      {rows.map((row, index) => {
        return (
          <SortableRow
            key={`${row.id}`}
            index={index}
            positions={positions}
            animatedIndex={animatedIndex}
            itemHeights={itemHeights}
            onDragEnd={onDragEnd}
          >
            <GalleryEditorRow sectionId={sectionId} row={row} queryRef={query} />
          </SortableRow>
        );
      })}
    </View>
  );
}

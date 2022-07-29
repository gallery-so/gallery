import { useMemo } from 'react';
import { useCollectionMetadataState } from './CollectionEditorContext';

// Width of draggable image for each Column # setting
export const IMAGE_SIZES: Record<number, number> = {
  1: 400,
  2: 320,
  3: 210,
  4: 145,
  5: 110,
  6: 78,
  7: 78,
  8: 78,
  9: 78,
  10: 78,
};

export default function useDndDimensions() {
  const {
    layout: { sectionLayout },
  } = useCollectionMetadataState();
  const columns = sectionLayout[0].columns;

  const paddingBetweenItemsPx = useMemo(() => {
    if (columns === 1 || columns === 2) {
      return 48;
    }
    if (columns === 3) {
      return 32;
    }
    if (columns === 4) {
      return 24;
    }
    if (columns === 5 || columns === 6) {
      return 16;
    }
    if (columns > 6) {
      return 8;
    }
    return 48;
  }, [columns]);

  return useMemo(
    () => ({
      itemWidth: IMAGE_SIZES[columns],
      dndWidth: IMAGE_SIZES[columns] * columns + paddingBetweenItemsPx * columns,
      paddingBetweenItemsPx,
    }),
    [columns, paddingBetweenItemsPx]
  );
}

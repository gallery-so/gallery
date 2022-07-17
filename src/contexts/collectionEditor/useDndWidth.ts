import { useCollectionMetadataState, useCollectionSettingsState } from './CollectionEditorContext';

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

export default function useDndWidth() {
  const {
    layout: { columns },
  } = useCollectionMetadataState();
  const { PADDING_BETWEEN_STAGED_ITEMS_PX } = useCollectionSettingsState();
  return {
    itemWidth: IMAGE_SIZES[columns],
    dndWidth: IMAGE_SIZES[columns] * columns + PADDING_BETWEEN_STAGED_ITEMS_PX * columns,
  };
}

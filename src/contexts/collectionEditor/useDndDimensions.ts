const DND_WIDTH = 824;

// Width of draggable image for each Column # setting
export const IMAGE_SIZES: Record<number, number> = {
  1: 400,
  2: (DND_WIDTH - 24 * 3) / 2,
  3: (DND_WIDTH - 24 * 4) / 3,
  4: (DND_WIDTH - 24 * 5) / 4,
  5: (DND_WIDTH - 24 * 6) / 5,
  6: (DND_WIDTH - 24 * 7) / 6,
  7: 78,
  8: 78,
  9: 78,
  10: 78,
};

export const SPACE_BETWEEN_ITEMS = 24;

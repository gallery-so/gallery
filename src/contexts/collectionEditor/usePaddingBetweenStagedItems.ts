import { useMemo } from 'react';

export default function usePaddingBetweenStagedItems(numColumns: number) {
  return useMemo(() => {
    if (numColumns === 1 || numColumns === 2) {
      return 48;
    }
    if (numColumns === 3) {
      return 32;
    }
    if (numColumns === 4) {
      return 24;
    }
    if (numColumns === 5 || numColumns === 6) {
      return 16;
    }
    if (numColumns > 6) {
      return 8;
    }
    return 48;
  }, [numColumns]);
}

import { useCallback, useState } from "react";

const dimensionCache = new Map<string, { width: number; height: number }>();

export function computeHeightAndWidth(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  console.log("Computing", { width, height });
  const aspectRatio = width / height;

  if (aspectRatio === 1) {
    return { width: maxWidth, height: maxHeight };
  } else if (aspectRatio < 1) {
    return { width: maxWidth * aspectRatio, height: maxHeight };
  } else {
    return { width: maxWidth, height: maxHeight / aspectRatio };
  }
}

export const useWidthHeight = (url: string) => {
  const [dimensions, setDimensions] = useState(
    dimensionCache.get(url) ?? { width: 400, height: 400 }
  );

  const handleLoad = useCallback((width: number, height: number) => {
    const result = computeHeightAndWidth(width, height, 250, 250);

    dimensionCache.set(url, result);

    setDimensions(result);
  }, []);

  return { dimensions, handleLoad };
};

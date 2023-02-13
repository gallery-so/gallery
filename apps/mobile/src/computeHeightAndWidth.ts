type Dimension = { width: number; height: number };

export function computeHeightAndWidth(
  aspectRatio: number,
  maxWidth: number,
  maxHeight: number
): Dimension {
  if (!aspectRatio || isNaN(aspectRatio)) {
    return { width: maxWidth, height: maxHeight };
  }

  if (aspectRatio === 1) {
    return { width: maxWidth, height: maxHeight };
  } else if (aspectRatio < 1) {
    return { width: maxWidth * aspectRatio, height: maxHeight };
  } else {
    return { width: maxWidth, height: maxHeight / aspectRatio };
  }
}

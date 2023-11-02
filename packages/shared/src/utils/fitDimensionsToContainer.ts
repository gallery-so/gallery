export type Dimensions = { width: number; height: number };

type fitDimensionToContainerArgs = {
  container: Dimensions;
  source: Dimensions;
};

export function fitDimensionsToContainerCover({
  container,
  source,
}: fitDimensionToContainerArgs): Dimensions {
  const containerAspectRatio = container.width / container.height;
  const sourceAspectRatio = source.width / source.height;
  let fittedWidth: number;
  let fittedHeight: number;

  if (containerAspectRatio < sourceAspectRatio) {
    // Container is narrower, so fit to width
    fittedWidth = container.width;
    fittedHeight = fittedWidth / sourceAspectRatio;
  } else {
    // Container is shorter, so fit to height
    fittedHeight = container.height;
    fittedWidth = fittedHeight * sourceAspectRatio;
  }

  return {
    width: fittedWidth,
    height: fittedHeight,
  };
}

export function fitDimensionsToContainerContain({
  container,
  source,
}: fitDimensionToContainerArgs): Dimensions {
  const containerAspectRatio = container.width / container.height;
  const sourceAspectRatio = source.width / source.height;
  let newWidth: number;
  let newHeight: number;

  if (sourceAspectRatio > containerAspectRatio) {
    // The source aspect ratio is wider than the container, so we should maximize the width.
    newWidth = container.width;
    newHeight = container.width / sourceAspectRatio;
  } else {
    // The source aspect ratio is narrower or equal to the container, so we should maximize the height.
    newHeight = container.height;
    newWidth = container.height * sourceAspectRatio;
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}

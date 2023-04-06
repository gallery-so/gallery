import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';

type fitDimensionToContainerArgs = {
  container: Dimensions;
  source: Dimensions;
};

export function fitDimensionsToContainer({
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

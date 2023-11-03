import { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, useWindowDimensions } from 'react-native';

import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { fitDimensionsToContainerContain } from '~/shared/utils/fitDimensionsToContainer';

type ImageState = { kind: 'loading' } | { kind: 'loaded'; dimensions: Dimensions | null };

export function useNftDetailAssetSizer() {
  const windowDimensions = useWindowDimensions();

  const [imageState, setImageState] = useState<ImageState>({ kind: 'loading' });
  const [viewDimensions, setViewDimensions] = useState<Dimensions | null>(null);

  const handleViewLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setViewDimensions({ width, height });
  }, []);

  const handleLoad = useCallback((dimensions?: Dimensions | null) => {
    setImageState({ kind: 'loaded', dimensions: dimensions ?? null });
  }, []);

  const finalAssetDimensions = useMemo((): Dimensions => {
    if (viewDimensions && imageState.kind === 'loaded' && imageState.dimensions) {
      // Give the piece a little bit of breathing room. This might be an issue
      // if we ever support landscape view (turning your phone horizontally).
      const MAX_HEIGHT = windowDimensions.height - 400;

      // Width is the width of the parent view (the screen - some padding)
      // Height is the max height for the image
      //
      // This will fit the image to the screen appropriately.
      const containerDimensions: Dimensions = { width: viewDimensions.width, height: MAX_HEIGHT };

      return fitDimensionsToContainerContain({
        container: containerDimensions,
        source: imageState.dimensions,
      });
    }

    // This is a fallback for when we don't have the image dimensions yet.
    // The user will never see the image in this state since it will be covered
    // by a loading skeleton UI anyway.
    return { width: 300, height: 300 };
  }, [imageState, viewDimensions, windowDimensions.height]);

  return {
    imageState,
    handleLoad,
    viewDimensions,
    handleViewLayout,
    finalAssetDimensions,
  };
}

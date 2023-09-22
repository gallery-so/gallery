import { ResizeMode } from 'expo-av';
import { createContext, PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, View, ViewProps } from 'react-native';

import { RawNftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { useNftDetailAssetSizer } from '~/screens/NftDetailScreen/NftDetailAsset/useNftDetailAssetSizer';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

type NftDetailAssetCacheSwapperContextType = {
  markDetailAssetAsLoaded: () => void;
};

export const NftDetailAssetCacheSwapperContext = createContext<
  NftDetailAssetCacheSwapperContextType | undefined
>(undefined);

type Props = PropsWithChildren<{
  style?: ViewProps['style'];
  cachedPreviewAssetUrl: string | null;
}>;

/**
 * This component is used to swap out the cached asset for the real asset once it's loaded.
 * The end goal is to ensure the user sees an image immediately if they just navigated
 * from a screen that had the cached asset.
 */
export function NftDetailAssetCacheSwapper({ children, style, cachedPreviewAssetUrl }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [fullyRemoved, setFullyRemoved] = useState(false);

  const assetSizer = useNftDetailAssetSizer();

  const markDetailAssetAsLoaded = useCallback(() => {
    setLoaded(true);

    // This is very intentionally done w/ a delay to ensure
    // the user doesn't see a flash if they are swapped out in the same render
    setTimeout(() => {
      setFullyRemoved(true);
    }, 50);
  }, []);

  const contextValue = useMemo((): NftDetailAssetCacheSwapperContextType => {
    return {
      markDetailAssetAsLoaded,
    };
  }, [markDetailAssetAsLoaded]);

  const [detailLayoutHeight, setDetailLayoutHeight] = useState<number | null>(null);
  const handleDetailLayout = useCallback((event: LayoutChangeEvent) => {
    setDetailLayoutHeight(event.nativeEvent.layout.height);
  }, []);

  // We need to do this in case the detail asset is taller than the preview asset.
  // This is because the detail asset is positioned absolutely, so it won't affect
  // the layout of the parent view.
  const maxHeight = Math.max(assetSizer.finalAssetDimensions.height, detailLayoutHeight ?? 0);

  const preview = useMemo(() => {
    return (
      <View
        onLayout={assetSizer.handleViewLayout}
        style={[
          assetSizer.finalAssetDimensions,
          {
            width: '100%',

            // The goal here is to ensure that the preview doesn't affect the height
            // after the detail asset has loaded and the preview asset is gone.
            height: fullyRemoved ? detailLayoutHeight ?? 0 : maxHeight,
          },
        ]}
      >
        {fullyRemoved ? null : (
          <RawNftPreviewAsset
            onLoad={assetSizer.handleLoad}
            tokenUrl={cachedPreviewAssetUrl ?? ''}
            resizeMode={ResizeMode.CONTAIN}
          />
        )}
      </View>
    );
  }, [
    assetSizer.finalAssetDimensions,
    assetSizer.handleLoad,
    assetSizer.handleViewLayout,
    cachedPreviewAssetUrl,
    detailLayoutHeight,
    fullyRemoved,
    maxHeight,
  ]);

  if (!cachedPreviewAssetUrl) {
    return <>{children}</>;
  }

  return (
    <View style={[style, { position: 'relative' }]}>
      <ReportingErrorBoundary fallback={preview}>
        {preview}

        <NftDetailAssetCacheSwapperContext.Provider value={contextValue}>
          <View
            onLayout={handleDetailLayout}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: loaded ? 1 : -1,
            }}
          >
            {children}
          </View>
        </NftDetailAssetCacheSwapperContext.Provider>
      </ReportingErrorBoundary>
    </View>
  );
}

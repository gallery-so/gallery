import { ResizeMode } from 'expo-av';
import { createContext, PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { View, ViewProps } from 'react-native';

import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { useNftDetailAssetSizer } from '~/screens/NftDetailScreen/NftDetailAsset/useNftDetailAssetSizer';

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
  const assetSizer = useNftDetailAssetSizer();

  const markDetailAssetAsLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  const contextValue = useMemo((): NftDetailAssetCacheSwapperContextType => {
    return {
      markDetailAssetAsLoaded,
    };
  }, [markDetailAssetAsLoaded]);

  if (!cachedPreviewAssetUrl) {
    return <>{children}</>;
  }

  return (
    <View style={[style, { position: 'relative' }]}>
      <View
        onLayout={assetSizer.handleViewLayout}
        style={[assetSizer.finalAssetDimensions, { width: '100%' }]}
      >
        <NftPreviewAsset
          onLoad={assetSizer.handleLoad}
          tokenUrl={cachedPreviewAssetUrl}
          resizeMode={ResizeMode.CONTAIN}
        />
      </View>

      <NftDetailAssetCacheSwapperContext.Provider value={contextValue}>
        <View
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
    </View>
  );
}

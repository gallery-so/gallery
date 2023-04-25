import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';

type GalleryTokenDimensionCacheContextType = {
  addDimensionsToCache: (tokenUrl: string, dimensions: Dimensions) => void;
  cache: Map<string, Dimensions>;
};
const GalleryTokenDimensionCacheContext = createContext<
  GalleryTokenDimensionCacheContextType | undefined
>(undefined);

export function GalleryTokenDimensionCacheProvider({ children }: PropsWithChildren) {
  const [cache] = useState<Map<string, Dimensions>>(new Map());

  const add = useCallback<GalleryTokenDimensionCacheContextType['addDimensionsToCache']>(
    (tokenUrl, dimensions) => {
      cache.set(tokenUrl, dimensions);
    },
    [cache]
  );

  const value = useMemo((): GalleryTokenDimensionCacheContextType => {
    return {
      cache,
      addDimensionsToCache: add,
    };
  }, [add, cache]);

  return (
    <GalleryTokenDimensionCacheContext.Provider value={value}>
      {children}
    </GalleryTokenDimensionCacheContext.Provider>
  );
}

export function useGalleryTokenDimensionCache(): GalleryTokenDimensionCacheContextType {
  const context = useContext(GalleryTokenDimensionCacheContext);

  if (!context) {
    throw new Error(
      'useGalleryTokenDimensionCache must be used within a GalleryTokenDimensionCacheProvider'
    );
  }

  return context;
}

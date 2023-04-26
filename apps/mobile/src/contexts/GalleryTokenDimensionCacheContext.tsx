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
  const [cache, setCache] = useState<Map<string, Dimensions>>(new Map());

  const add = useCallback<GalleryTokenDimensionCacheContextType['addDimensionsToCache']>(
    (tokenUrl, dimensions) => {
      setCache((previous) => {
        if (!dimensions) {
          return previous;
        }

        const existing = previous.get(tokenUrl);
        if (
          existing &&
          existing.height === dimensions.height &&
          existing.width === dimensions.width
        ) {
          return previous;
        }

        const newCache = new Map(previous);
        newCache.set(tokenUrl, dimensions);
        return newCache;
      });
    },
    []
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

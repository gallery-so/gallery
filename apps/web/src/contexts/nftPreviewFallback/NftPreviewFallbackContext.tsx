import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type LoadedNftAssetType = 'preview' | 'raw';

export type Dimensions = {
  width?: number;
  height?: number;
};

export type CacheParams = {
  [tokenId: string]: {
    type: LoadedNftAssetType;
    url: string;
    dimensions: Dimensions;
  };
};

type NftPreviewFallbackState = {
  cacheLoadedImageUrls: (
    tokenId: string,
    type: LoadedNftAssetType,
    url: string,
    dimensions: Dimensions
  ) => void;

  cachedUrls: CacheParams;
};

const defaultNftPreviewFallbackState: NftPreviewFallbackState = {
  cacheLoadedImageUrls: () => {},
  cachedUrls: {},
};

const NftPreviewFallbackContext = createContext<NftPreviewFallbackState>(
  defaultNftPreviewFallbackState
);

export const useNftPreviewFallbackState = (): NftPreviewFallbackState => {
  const context = useContext(NftPreviewFallbackContext);
  if (!context) {
    throw new Error('Attempted to use NftPreviewFallbackContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode | ReactNode[] };

const NftPreviewFallbackProvider = ({ children }: Props) => {
  const [cachedUrls, setCachedUrls] = useState<CacheParams>({});

  const cacheLoadedImageUrls = useCallback(
    (tokenId: string, type: LoadedNftAssetType, url: string, dimensions: Dimensions) => {
      setCachedUrls((prevCachedUrls) => ({
        ...prevCachedUrls,
        [tokenId]: {
          type: type,
          url: url,
          dimensions: dimensions,
        },
      }));
    },
    []
  );

  const contextValue: NftPreviewFallbackState = useMemo(() => {
    return {
      cachedUrls,
      cacheLoadedImageUrls,
    };
  }, [cachedUrls, cacheLoadedImageUrls]);

  return (
    <NftPreviewFallbackContext.Provider value={contextValue}>
      {children}
    </NftPreviewFallbackContext.Provider>
  );
};

NftPreviewFallbackProvider.displayName = 'NftPreviewFallbackProvider';

export default NftPreviewFallbackProvider;

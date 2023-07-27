import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface LoadedUrlsMap {
  [tokenId: string]: {
    previewUrl: string;
    rawUrl?: string;
  };
}

export type CacheParams = {
  [tokenId: string]: {
    type: 'preview' | 'raw';
    url: string;
  };
};

type NftPreviewFallbackState = {
  loadedUrlsMap: LoadedUrlsMap;
  updateLoadedUrlsMap: (tokenId: string, previewUrl: string, rawUrl: string) => void;
  cacheLoadedImageUrls: (tokenId: string, type: 'preview' | 'raw', url: string) => void;
  cachedUrls: CacheParams;
};

const defaultNftPreviewFallbackState: NftPreviewFallbackState = {
  loadedUrlsMap: {},
  updateLoadedUrlsMap: () => {},
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
  const [loadedUrlsMap, setLoadedUrlsMap] = useState<LoadedUrlsMap>({});
  const [cachedUrls, setCachedUrls] = useState<CacheParams>({});

  // Function to update the loadedUrls map inside the context
  const updateLoadedUrlsMap = useCallback((tokenId: string, previewUrl: string, rawUrl: string) => {
    setLoadedUrlsMap((prevLoadedUrlsMap) => ({
      ...prevLoadedUrlsMap,
      [tokenId]: {
        previewUrl: previewUrl,
        rawUrl: rawUrl,
      },
    }));
  }, []);

  const cacheLoadedImageUrls = useCallback(
    (tokenId: string, type: 'preview' | 'raw', url: string) => {
      setCachedUrls((prevCachedUrls) => ({
        ...prevCachedUrls,
        [tokenId]: {
          type: type,
          url: url,
        },
      }));
    },
    []
  );

  const contextValue: NftPreviewFallbackState = useMemo(() => {
    return {
      loadedUrlsMap,
      cachedUrls,
      updateLoadedUrlsMap,
      cacheLoadedImageUrls,
    };
  }, [loadedUrlsMap, cachedUrls, updateLoadedUrlsMap, cacheLoadedImageUrls]);

  return (
    <NftPreviewFallbackContext.Provider value={contextValue}>
      {children}
    </NftPreviewFallbackContext.Provider>
  );
};

NftPreviewFallbackProvider.displayName = 'NftPreviewFallbackProvider';

export default NftPreviewFallbackProvider;

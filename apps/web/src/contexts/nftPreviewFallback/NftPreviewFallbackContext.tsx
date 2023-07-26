import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface LoadedUrlsMap {
  [tokenId: string]: {
    previewUrl: string;
    rawUrl?: string;
  };
}

type NftPreviewFallbackState = {
  loadedUrlsMap: LoadedUrlsMap;
  updateLoadedUrlsMap: (tokenId: string, previewUrl: string, rawUrl: string) => void;
};

const defaultNftPreviewFallbackState: NftPreviewFallbackState = {
  loadedUrlsMap: {},
  updateLoadedUrlsMap: () => {},
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

  const contextValue: NftPreviewFallbackState = useMemo(() => {
    return {
      loadedUrlsMap,
      updateLoadedUrlsMap,
    };
  }, [loadedUrlsMap, updateLoadedUrlsMap]);

  return (
    <NftPreviewFallbackContext.Provider value={contextValue}>
      {children}
    </NftPreviewFallbackContext.Provider>
  );
};

NftPreviewFallbackProvider.displayName = 'NftPreviewFallbackProvider';

export default NftPreviewFallbackProvider;

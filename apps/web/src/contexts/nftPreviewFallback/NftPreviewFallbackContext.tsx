import { createContext, ReactNode, useContext, useState } from 'react';

interface PreviewUrlMap {
  [key: string]: string;
}

type NftPreviewFallbackState = {
  previewUrlMap: PreviewUrlMap;
  updatePreviewUrlMap: (key: string, value: string) => void;
};

const NftPreviewFallbackContext = createContext<NftPreviewFallbackState | undefined>(undefined);

export const useNftPreviewFallbackState = (): NftPreviewFallbackState => {
  const context = useContext(NftPreviewFallbackContext);
  if (!context) {
    throw new Error('Attempted to use NftPreviewFallbackContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode | ReactNode[] };

const NftPreviewFallbackProvider = ({ children }: Props) => {
  const [previewUrlMap, setPreviewUrlMap] = useState<PreviewUrlMap>({});

  // Function to update the previewUrl map inside the context
  const updatePreviewUrlMap = (key: string, value: string) => {
    setPreviewUrlMap((prevPreviewUrlMap) => ({
      ...prevPreviewUrlMap,
      [key]: value,
    }));
  };

  const contextValue: NftPreviewFallbackState = {
    previewUrlMap,
    updatePreviewUrlMap,
  };

  return (
    <NftPreviewFallbackContext.Provider value={contextValue}>
      {children}
    </NftPreviewFallbackContext.Provider>
  );
};

NftPreviewFallbackProvider.displayName = 'NftPreviewFallbackProvider';

export default NftPreviewFallbackProvider;

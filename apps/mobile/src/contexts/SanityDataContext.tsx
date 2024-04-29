import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchSanityContent } from 'src/utils/sanity';
import { useEffectOnAppForeground } from 'src/utils/useEffectOnAppForeground';

export type MintProject = {
  name: string;
  internalId: string;
  startDate: string;
  endDate: string;
  highlightProjectId: string;
  previewImageUrl: string;
  artistName: string;
  collectionName: string;
  title: string;
  description: string;
  funFacts: string[];
  active: boolean;
};

type sanityDocumentTypes = {
  mintProjects: MintProject[];
};

type SanityDataContextType = {
  data: sanityDocumentTypes | null;
};

const SanityDataContext = createContext<SanityDataContextType | undefined>(undefined);

export function useSanityDataContext() {
  const value = useContext(SanityDataContext);
  if (!value) {
    throw new Error('Tried to use SanityDataContext without a Provider');
  }
  return value;
}

export default function SanityDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<sanityDocumentTypes | null>(null);
  const fetchData = useCallback(async () => {
    console.log('fetching');
    try {
      const result = await fetchSanityContent(`
      *[_type == "mintProject"] {
          name,
          internalId,
          startDate,
          endDate,
          highlightProjectId,
          "previewImageUrl": previewImage.asset->url,
          artistName,
          collectionName,
          title,
          description,
          funFacts,
          active
        }`);
      if (result) {
        setData({ mintProjects: result });
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffectOnAppForeground(fetchData);

  useEffect(() => {
    fetchData();
    // Only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => {
    return {
      data,
    };
  }, [data]);

  return <SanityDataContext.Provider value={value}>{children}</SanityDataContext.Provider>;
}

import { useMutateAllNftsCache } from 'hooks/api/nfts/useAllNfts';
import { useRefreshOpenseaSync } from 'hooks/api/nfts/useOpenseaSync';
import {
  ReactNode,
  createContext,
  useContext,
  memo,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from 'react';

export type WizardDataState = {
  id: string;
  isRefreshingNfts: boolean;
  handleRefreshNfts: () => void;
};

const WizardDataContext = createContext<WizardDataState>({
  id: '',
  isRefreshingNfts: false,
  handleRefreshNfts: () => {},
});

export const useWizardId = (): WizardDataState['id'] => {
  const context = useContext(WizardDataContext);
  if (!context) {
    throw new Error('Attempted to use WizardDataContext without a provider');
  }

  return context.id;
};

export const useRefreshNftConfig = () => {
  const context = useContext(WizardDataContext);
  if (!context) {
    throw new Error('Attempted to use WizardDataContext without a provider');
  }

  return context;
};

type Props = { id: string; children: ReactNode };

export default memo(function WizardDataProvider({ id, children }: Props) {
  const [isRefreshingNfts, setIsRefreshingNfts] = useState(false);

  const refreshOpenseaSync = useRefreshOpenseaSync();
  const mutateAllNftsCache = useMutateAllNftsCache();

  const handleRefreshNfts = useCallback(async () => {
    setIsRefreshingNfts(true);
    console.log('refreshing');
    try {
      await refreshOpenseaSync();
      void mutateAllNftsCache();
      console.log('done');
    } catch {
      // TODO: error while attempting torefresh!
      console.log('not done');
    }

    setIsRefreshingNfts(false);
  }, [mutateAllNftsCache, refreshOpenseaSync]);

  useEffect(() => {
    if (id === 'onboarding' && !isRefreshingNfts) {
      void handleRefreshNfts();
    }
  }, [id, isRefreshingNfts, handleRefreshNfts]);

  const wizardDataState = useMemo(
    () => ({ id, isRefreshingNfts, handleRefreshNfts }),
    [id, isRefreshingNfts, handleRefreshNfts]
  );

  return (
    <WizardDataContext.Provider value={wizardDataState}>{children}</WizardDataContext.Provider>
  );
});

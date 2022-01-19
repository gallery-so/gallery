import { useMutateAllNftsCache } from 'hooks/api/nfts/useAllNfts';
import { useRefreshOpenseaSync } from 'hooks/api/nfts/useOpenseaSync';
import { ReactNode, createContext, useContext, memo, useMemo, useEffect, useState } from 'react';

export type WizardDataState = {
  id: string;
  isRefreshingNfts: boolean;
};

const WizardDataContext = createContext<WizardDataState>({
  id: '',
  isRefreshingNfts: false,
});

export const useWizardId = (): WizardDataState['id'] => {
  const context = useContext(WizardDataContext);
  if (!context) {
    throw new Error('Attempted to use WizardDataContext without a provider');
  }

  return context.id;
};

type Props = { id: string; children: ReactNode };

export default memo(function WizardDataProvider({ id, children }: Props) {
  const [isRefreshingNfts, setIsRefreshingNfts] = useState(false);

  const wizardDataState = useMemo(() => ({ id, isRefreshingNfts }), [id, isRefreshingNfts]);

  const refreshOpenseaSync = useRefreshOpenseaSync();
  const mutateAllNftsCache = useMutateAllNftsCache();

  useEffect(() => {
    async function refreshNfts() {
      setIsRefreshingNfts(true);
      try {
        await refreshOpenseaSync();
        void mutateAllNftsCache();
      } catch {
        // TODO: error while attempting torefresh!
      }

      setIsRefreshingNfts(false);
    }

    if (id === 'onboarding' && !isRefreshingNfts) {
      void refreshNfts();
    }
  }, [id, isRefreshingNfts, mutateAllNftsCache, refreshOpenseaSync]);

  return (
    <WizardDataContext.Provider value={wizardDataState}>{children}</WizardDataContext.Provider>
  );
});

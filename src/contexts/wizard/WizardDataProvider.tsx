import { captureException } from '@sentry/nextjs';
import { useToastActions } from 'contexts/toast/ToastContext';
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
  const { pushToast } = useToastActions();

  const handleRefreshNfts = useCallback(async () => {
    setIsRefreshingNfts(true);

    try {
      await refreshOpenseaSync();
      void mutateAllNftsCache();
    } catch (error: unknown) {
      captureException(error);
      pushToast(
        'Error while fetching latest NFTs. Opensea may be temporarily unavailable. Please try again later.'
      );
    }

    setIsRefreshingNfts(false);
  }, [mutateAllNftsCache, pushToast, refreshOpenseaSync]);

  useEffect(() => {
    if (id === 'onboarding') {
      void handleRefreshNfts();
    }
    // just want this running once for the welcome screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wizardDataState = useMemo(
    () => ({ id, isRefreshingNfts, handleRefreshNfts }),
    [id, isRefreshingNfts, handleRefreshNfts]
  );

  return (
    <WizardDataContext.Provider value={wizardDataState}>{children}</WizardDataContext.Provider>
  );
});

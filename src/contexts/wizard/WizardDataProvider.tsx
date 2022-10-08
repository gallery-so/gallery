import { captureException } from '@sentry/nextjs';
import { useToastActions } from 'contexts/toast/ToastContext';
import { organizeCollectionQuery } from 'flows/../../components/ManageGallery/OrganizeCollection/OrganizeCollection';
import useSyncTokens from 'hooks/api/tokens/useSyncTokens';
import { ReactNode, createContext, useContext, memo, useMemo, useState, useCallback } from 'react';
import { PreloadedQuery, useQueryLoader } from 'react-relay';
import { OrganizeCollectionQuery } from '__generated__/OrganizeCollectionQuery.graphql';

export type WizardDataState = {
  id: string;
  isRefreshingNfts: boolean;
  handleRefreshNfts: () => void;
  setIsRefreshingNfts: (refreshing: boolean) => void;
  queryRef: PreloadedQuery<OrganizeCollectionQuery, Record<string, unknown>> | null | undefined;
};

const WizardDataContext = createContext<WizardDataState | undefined>(undefined);

export const useWizardId = (): WizardDataState['id'] => {
  const context = useContext(WizardDataContext);
  if (!context) {
    throw new Error('Attempted to use WizardDataContext without a provider');
  }

  return context.id;
};

export const useWizardState = () => {
  const context = useContext(WizardDataContext);
  if (!context) {
    throw new Error('Attempted to use WizardDataContext without a provider');
  }

  return context;
};

type Props = { id: string; children: ReactNode };

export default memo(function WizardDataProvider({ id, children }: Props) {
  const [queryRef, loadQuery] = useQueryLoader<OrganizeCollectionQuery>(organizeCollectionQuery);

  const [isRefreshingNfts, setIsRefreshingNfts] = useState(false);

  const syncTokens = useSyncTokens();

  const { pushToast } = useToastActions();

  const handleRefreshNfts = useCallback(async () => {
    setIsRefreshingNfts(true);

    try {
      loadQuery({}, { fetchPolicy: 'store-and-network' });
      await syncTokens();
    } catch (error: unknown) {
      captureException(error);
      if (error instanceof Error) {
        pushToast({ message: error.message });
      }
    }

    setIsRefreshingNfts(false);
  }, [loadQuery, pushToast, syncTokens]);

  const wizardDataState = useMemo(
    () => ({ id, isRefreshingNfts, handleRefreshNfts, queryRef, setIsRefreshingNfts }),
    [id, isRefreshingNfts, handleRefreshNfts, queryRef]
  );

  return (
    <WizardDataContext.Provider value={wizardDataState}>{children}</WizardDataContext.Provider>
  );
});

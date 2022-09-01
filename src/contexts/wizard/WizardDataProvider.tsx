import { captureException } from '@sentry/nextjs';
import { useToastActions } from 'contexts/toast/ToastContext';
import { organizeCollectionQuery } from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import useSyncTokens from 'hooks/api/tokens/useSyncTokens';
import { createContext, memo, ReactNode, useCallback, useContext, useMemo } from 'react';
import { PreloadedQuery, useQueryLoader } from 'react-relay';
import { OrganizeCollectionQuery } from '__generated__/OrganizeCollectionQuery.graphql';

export type WizardDataState = {
  id: string;
  handleRefreshNfts: () => void;
  queryRef: PreloadedQuery<OrganizeCollectionQuery, Record<string, unknown>> | null | undefined;
};

const WizardDataContext = createContext<WizardDataState>({
  id: '',
  handleRefreshNfts: () => {},
  queryRef: null,
});

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

  const syncTokens = useSyncTokens();

  const { pushToast } = useToastActions();

  const handleRefreshNfts = useCallback(async () => {
    try {
      loadQuery({}, { fetchPolicy: 'store-and-network' });
      await syncTokens();
    } catch (error: unknown) {
      captureException(error);
      if (error instanceof Error) {
        pushToast({ message: error.message });
      }
    }
  }, [loadQuery, pushToast, syncTokens]);

  const wizardDataState = useMemo(
    () => ({ id, handleRefreshNfts, queryRef }),
    [id, handleRefreshNfts, queryRef]
  );

  return (
    <WizardDataContext.Provider value={wizardDataState}>{children}</WizardDataContext.Provider>
  );
});

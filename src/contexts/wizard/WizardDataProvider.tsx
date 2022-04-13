import { captureException } from '@sentry/nextjs';
import { useToastActions } from 'contexts/toast/ToastContext';
import { organizeCollectionQuery } from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import useRefreshOpenseaNfts from 'hooks/api/nfts/useRefreshOpenseaNfts';
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
import { graphql, PreloadedQuery, useLazyLoadQuery, useQueryLoader } from 'react-relay';
import { OrganizeCollectionQuery } from '__generated__/OrganizeCollectionQuery.graphql';
import { WizardDataProviderQuery } from '__generated__/WizardDataProviderQuery.graphql';

export type WizardDataState = {
  id: string;
  isRefreshingNfts: boolean;
  handleRefreshNfts: () => void;
  queryRef: PreloadedQuery<OrganizeCollectionQuery, Record<string, unknown>> | null | undefined;
};

const WizardDataContext = createContext<WizardDataState>({
  id: '',
  isRefreshingNfts: false,
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

  const [isRefreshingNfts, setIsRefreshingNfts] = useState(false);

  // this lazyLoadQuery will be removed after we move off of opensea
  const { viewer } = useLazyLoadQuery<WizardDataProviderQuery>(
    graphql`
      query WizardDataProviderQuery {
        viewer {
          ... on Viewer {
            __typename
            ...useRefreshOpenseaNftsFragment
          }
        }
      }
    `,
    {}
  );

  if (viewer?.__typename !== 'Viewer') {
    throw new Error('expected Viewer in WizardDataProvider');
  }

  const refreshOpenseaNfts = useRefreshOpenseaNfts({ viewerRef: viewer });

  const { pushToast } = useToastActions();

  const handleRefreshNfts = useCallback(async () => {
    setIsRefreshingNfts(true);

    try {
      await refreshOpenseaNfts();
      loadQuery({}, { fetchPolicy: 'store-and-network' });
    } catch (error: unknown) {
      captureException(error);
      pushToast(
        'Error while fetching latest NFTs. Opensea may be temporarily unavailable. Please try again later.'
      );
    }

    setIsRefreshingNfts(false);
  }, [loadQuery, pushToast, refreshOpenseaNfts]);

  useEffect(() => {
    if (id === 'onboarding') {
      void handleRefreshNfts();
    }
    // just want this running once for the welcome screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wizardDataState = useMemo(
    () => ({ id, isRefreshingNfts, handleRefreshNfts, queryRef }),
    [id, isRefreshingNfts, handleRefreshNfts, queryRef]
  );

  return (
    <WizardDataContext.Provider value={wizardDataState}>{children}</WizardDataContext.Provider>
  );
});

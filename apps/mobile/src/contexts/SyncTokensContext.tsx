import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { graphql } from 'react-relay';

import { Chain, SyncTokensContextMutation } from '~/generated/SyncTokensContextMutation.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

import { useToastActions } from './ToastContext';
import { useTokenStateManagerContext } from './TokenStateManagerContext';

type SyncTokensActions = {
  syncTokens: (chain: Chain) => void;
  isSyncing: boolean;
};

const SyncTokensActionsContext = createContext<SyncTokensActions | undefined>(undefined);

export const useSyncTokenstActions = (): SyncTokensActions => {
  const context = useContext(SyncTokensActionsContext);
  if (!context) {
    throw new Error('Attempted to use SyncTokensActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

const SyncTokensProvider = memo(({ children }: Props) => {
  const { clearTokenFailureState } = useTokenStateManagerContext();
  const [syncTokens] = usePromisifiedMutation<SyncTokensContextMutation>(
    graphql`
      mutation SyncTokensContextMutation($chain: Chain!) {
        syncTokens(chains: [$chain]) {
          __typename
          ... on SyncTokensPayload {
            viewer {
              ... on Viewer {
                user {
                  tokens(ownershipFilter: [Creator, Holder]) {
                    dbid
                  }
                }
              }
            }
          }
          ... on ErrNotAuthorized {
            message
          }
          ... on ErrSyncFailed {
            message
          }
        }
      }
    `
  );

  const [isSyncing, setIsSyncing] = useState(false);

  const { pushToast } = useToastActions();

  const sync = useCallback(
    async (chain: Chain) => {
      function showFailure() {
        pushToast({
          autoClose: true,
          message:
            "Something went wrong while syncing your tokens. We're looking into it. Please try again in a few minutes.",
        });
      }

      try {
        setIsSyncing(true);
        const response = await syncTokens({
          variables: {
            chain,
          },
        });

        if (response.syncTokens?.__typename !== 'SyncTokensPayload') {
          showFailure();
        } else {
          const tokenIds = removeNullValues(
            response.syncTokens?.viewer?.user?.tokens?.map((token) => {
              return token?.dbid;
            })
          );
          clearTokenFailureState(tokenIds);
        }
      } catch (error) {
        showFailure();
      } finally {
        setIsSyncing(false);
      }
    },
    [clearTokenFailureState, pushToast, syncTokens]
  );

  const value = useMemo(() => {
    return { syncTokens: sync, isSyncing };
  }, [isSyncing, sync]);

  return (
    <SyncTokensActionsContext.Provider value={value}>{children}</SyncTokensActionsContext.Provider>
  );
});

SyncTokensProvider.displayName = 'SyncTokensProvider';

export default SyncTokensProvider;

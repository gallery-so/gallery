import { useCallback, useMemo } from 'react';
import { graphql } from 'relay-runtime';

import { useNftErrorContext } from '~/contexts/NftErrorContext';
import { useSyncTokensContext } from '~/contexts/SyncTokensLockContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import {
  Chain,
  useSyncTokensCollectedMutation,
} from '~/generated/useSyncTokensCollectedMutation.graphql';
import { useSyncTokensCreatedMutation } from '~/generated/useSyncTokensCreatedMutation.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type syncTokensProps = {
  chain: Chain | Chain[];
  type: 'Collected' | 'Created';
  silent?: boolean;
};

export default function useSyncTokens() {
  const { clearTokenFailureState } = useNftErrorContext();
  const { isLocked, lock, startSyncing, stopSyncing, isSyncing } = useSyncTokensContext();

  const [syncCollectedTokens] = usePromisifiedMutation<useSyncTokensCollectedMutation>(
    graphql`
      mutation useSyncTokensCollectedMutation($chains: [Chain!]) {
        syncTokens(chains: $chains) {
          __typename
          ... on SyncTokensPayload {
            viewer {
              # This should be sufficient to capture all the things
              # we want to refresh. Don't @me when this fails.
              ...GalleryEditorViewerFragment

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

  const [syncCreatedTokens] = usePromisifiedMutation<useSyncTokensCreatedMutation>(
    graphql`
      mutation useSyncTokensCreatedMutation($chains: [Chain!]) {
        syncCreatedTokensForNewContracts(input: { includeChains: $chains }) {
          __typename
          ... on SyncCreatedTokensForNewContractsPayload {
            viewer {
              # This should be sufficient to capture all the things
              # we want to refresh. Don't @me when this fails.
              ...GalleryEditorViewerFragment

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

  const { pushToast } = useToastActions();
  const sync = useCallback(
    async ({ chain, type, silent = false }: syncTokensProps) => {
      if (!silent) {
        pushToast({
          message: 'We’re retrieving your new pieces. This may take up to a few minutes.',
          autoClose: true,
        });
      }

      if (isLocked) {
        return false;
      }

      const unlock = lock();

      function showFailure() {
        if (!silent) {
          pushToast({
            autoClose: true,
            message:
              "Something went wrong while syncing your tokens. We're looking into it. Please try again in a few minutes.",
          });
        }
      }
      try {
        if (isSyncing) {
          return;
        }
        startSyncing();
        if (type === 'Collected') {
          const response = await syncCollectedTokens({
            variables: {
              chains: Array.isArray(chain) ? chain : [chain],
            },
          });

          if (response.syncTokens?.__typename !== 'SyncTokensPayload') {
            showFailure();
          } else {
            const tokenIds = removeNullValues(
              response.syncTokens.viewer?.user?.tokens?.map((token) => {
                return token?.dbid;
              })
            );

            clearTokenFailureState(tokenIds);
          }
        } else {
          const response = await syncCreatedTokens({
            variables: {
              chains: Array.isArray(chain) ? chain : [chain],
            },
          });

          if (
            response.syncCreatedTokensForNewContracts?.__typename !==
            'SyncCreatedTokensForNewContractsPayload'
          ) {
            showFailure();
          } else {
            const tokenIds = removeNullValues(
              response.syncCreatedTokensForNewContracts.viewer?.user?.tokens?.map((token) => {
                return token?.dbid;
              })
            );

            clearTokenFailureState(tokenIds);
          }
        }
      } catch (error) {
        showFailure();
      } finally {
        stopSyncing();
        unlock();
      }
    },
    [
      clearTokenFailureState,
      isLocked,
      isSyncing,
      lock,
      pushToast,
      startSyncing,
      stopSyncing,
      syncCollectedTokens,
      syncCreatedTokens,
    ]
  );

  return useMemo(() => {
    return { isLocked, syncTokens: sync, isSyncing };
  }, [isLocked, isSyncing, sync]);
}

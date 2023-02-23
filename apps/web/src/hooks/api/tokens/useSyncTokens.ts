import { useCallback, useMemo } from 'react';
import { graphql } from 'relay-runtime';

import { useNftErrorContext } from '~/contexts/NftErrorContext';
import { useSyncTokensContext } from '~/contexts/SyncTokensLockContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { Chain, useSyncTokensMutation } from '~/generated/useSyncTokensMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { removeNullValues } from '~/utils/removeNullValues';

export default function useSyncTokens() {
  const { clearTokenFailureState } = useNftErrorContext();
  const { isLocked, lock } = useSyncTokensContext();

  const [syncTokens] = usePromisifiedMutation<useSyncTokensMutation>(
    graphql`
      mutation useSyncTokensMutation($chain: Chain!) {
        syncTokens(chains: [$chain]) {
          __typename
          ... on SyncTokensPayload {
            viewer {
              # This should be sufficient to capture all the things
              # we want to refresh. Don't @me when this fails.
              ...CollectionEditorViewerFragment

              ... on Viewer {
                user {
                  tokens {
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
    async (chain: Chain) => {
      pushToast({
        message: 'We’re retrieving your new pieces. This may take up to a few minutes.',
        autoClose: true,
      });

      if (isLocked) {
        return false;
      }

      const unlock = lock();

      function showFailure() {
        pushToast({
          autoClose: true,
          message:
            "Something went wrong while syncing your tokens. We're looking into it. Please try again in a few minutes.",
        });
      }

      try {
        const response = await syncTokens({
          variables: {
            chain,
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
      } catch (error) {
        showFailure();
      } finally {
        unlock();
      }
    },
    [clearTokenFailureState, isLocked, lock, pushToast, syncTokens]
  );

  return useMemo(() => {
    return { isLocked, syncTokens: sync };
  }, [isLocked, sync]);
}

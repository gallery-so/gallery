import { useCallback, useMemo, useState } from 'react';
import { graphql } from 'relay-runtime';

import { useToastActions } from '~/contexts/ToastContext';
import { Chain, useSyncTokensMutation } from '~/generated/useSyncTokensMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useSyncTokens() {
  const [syncTokens] = usePromisifiedMutation<useSyncTokensMutation>(
    graphql`
      mutation useSyncTokensMutation($chain: Chain!) {
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
        }
      } catch (error) {
        showFailure();
      } finally {
        setIsSyncing(false);
      }
    },
    [pushToast, syncTokens]
  );

  return useMemo(() => {
    return { syncTokens: sync, isSyncing };
  }, [isSyncing, sync]);
}

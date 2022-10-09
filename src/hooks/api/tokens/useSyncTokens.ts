import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback, useMemo } from 'react';
import { graphql } from 'relay-runtime';
import { useSyncTokensMutation } from '__generated__/useSyncTokensMutation.graphql';
import { useSyncTokensContext } from 'contexts/SyncTokensLockContext';
import { useToastActions } from 'contexts/toast/ToastContext';

export default function useSyncTokens() {
  const { isLocked, lock } = useSyncTokensContext();

  const [syncTokens] = usePromisifiedMutation<useSyncTokensMutation>(
    graphql`
      mutation useSyncTokensMutation {
        syncTokens {
          __typename
          ... on SyncTokensPayload {
            viewer {
              # This should be sufficient to capture all the things
              # we want to refresh. Don't @me when this fails.
              ...CollectionEditorViewerFragment
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
  const sync = useCallback(async () => {
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
        variables: {},
      });

      if (response.syncTokens?.__typename !== 'SyncTokensPayload') {
        showFailure();
      }
    } catch (error) {
      showFailure();
    } finally {
      unlock();
    }
  }, [isLocked, lock, pushToast, syncTokens]);

  return useMemo(() => {
    return { isLocked, syncTokens: sync };
  }, [isLocked, sync]);
}
